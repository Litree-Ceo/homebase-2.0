/**
 * LITLABS API - Blob Storage Functions
 * Upload, download, and manage files in Azure Blob Storage
 */
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { registerEpipeHandler } from "../shared/epipe";

// Singleton client
let blobServiceClient: BlobServiceClient | null = null;

registerEpipeHandler();

function getBlobClient(): BlobServiceClient {
  if (!blobServiceClient) {
    const connectionString = process.env.BLOB_CONNECTION_STRING!;
    blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }
  return blobServiceClient;
}

// POST /api/blob/{container}/upload - Upload a file
export async function uploadBlob(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const fileName = request.query.get("fileName");

    if (!containerName || !fileName) {
      return {
        status: 400,
        jsonBody: { error: "Container and fileName required" },
      };
    }

    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient(containerName);

    // Create container if not exists
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const data = await request.arrayBuffer();
    const contentType =
      request.headers.get("content-type") || "application/octet-stream";

    await blockBlobClient.uploadData(Buffer.from(data), {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    context.log(`Uploaded blob: ${containerName}/${fileName}`);

    return {
      status: 201,
      jsonBody: {
        url: blockBlobClient.url,
        container: containerName,
        fileName: fileName,
        contentType: contentType,
      },
    };
  } catch (error: any) {
    context.error("Blob upload error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// GET /api/blob/{container}/{*fileName} - Download or get SAS URL
export async function downloadBlob(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const fileName = request.params.fileName;
    const sasMode = request.query.get("sas") === "true";

    if (!containerName || !fileName) {
      return {
        status: 400,
        jsonBody: { error: "Container and fileName required" },
      };
    }

    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return { status: 404, jsonBody: { error: "Blob not found" } };
    }

    if (sasMode) {
      // Generate SAS URL (valid for 1 hour)
      const expiresOn = new Date(Date.now() + 3600 * 1000);
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName: fileName,
          permissions: BlobSASPermissions.parse("r"),
          expiresOn,
        },
        blobClient.credential as StorageSharedKeyCredential
      ).toString();

      return {
        status: 200,
        jsonBody: {
          url: `${blockBlobClient.url}?${sasToken}`,
          expiresOn: expiresOn.toISOString(),
        },
      };
    }

    // Direct download
    const downloadResponse = await blockBlobClient.download();
    const data = await streamToBuffer(downloadResponse.readableStreamBody!);

    return {
      status: 200,
      headers: {
        "Content-Type":
          downloadResponse.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
      body: data,
    };
  } catch (error: any) {
    context.error("Blob download error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// DELETE /api/blob/{container}/{*fileName}
export async function deleteBlob(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const fileName = request.params.fileName;

    if (!containerName || !fileName) {
      return {
        status: 400,
        jsonBody: { error: "Container and fileName required" },
      };
    }

    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.deleteIfExists();

    context.log(`Deleted blob: ${containerName}/${fileName}`);

    return { status: 204 };
  } catch (error: any) {
    context.error("Blob delete error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// GET /api/blob/{container} - List blobs
export async function listBlobs(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const containerName = request.params.container;
    const prefix = request.query.get("prefix") || "";

    if (!containerName) {
      return { status: 400, jsonBody: { error: "Container required" } };
    }

    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient(containerName);

    const blobs: {
      name: string;
      size: number;
      lastModified: string;
      contentType: string;
    }[] = [];

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      blobs.push({
        name: blob.name,
        size: blob.properties.contentLength || 0,
        lastModified: blob.properties.lastModified?.toISOString() || "",
        contentType: blob.properties.contentType || "",
      });
    }

    return {
      status: 200,
      jsonBody: { blobs, count: blobs.length },
    };
  } catch (error: any) {
    context.error("Blob list error:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
}

// Helper: Convert stream to buffer
async function streamToBuffer(
  readableStream: NodeJS.ReadableStream
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) =>
      chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data))
    );
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
}

// Register HTTP endpoints
app.http("blob-upload", {
  methods: ["POST"],
  authLevel: "function",
  route: "blob/{container}/upload",
  handler: uploadBlob,
});

app.http("blob-download", {
  methods: ["GET"],
  authLevel: "function",
  route: "blob/{container}/{*fileName}",
  handler: downloadBlob,
});

app.http("blob-delete", {
  methods: ["DELETE"],
  authLevel: "function",
  route: "blob/{container}/{*fileName}",
  handler: deleteBlob,
});

app.http("blob-list", {
  methods: ["GET"],
  authLevel: "function",
  route: "blob/{container}",
  handler: listBlobs,
});
