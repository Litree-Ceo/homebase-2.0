import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createProject = functions.https.onCall(async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { name, description, url, sourceCodeUrl, tags, imageUrl, status } = data;

  if (!(typeof name === "string") || name.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a " +
        'argument "name" which must be a non-empty string.'
    );
  }

  const projectData = {
    name,
    description: description || "",
    url: url || "",
    sourceCodeUrl: sourceCodeUrl || "",
    tags: tags || [],
    imageUrl: imageUrl || "",
    status: status || "in-progress",
    userId: auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const project = await admin.firestore().collection("projects").add(projectData);
    return { id: project.id };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating project."
    );
  }
});

export const getProjects = functions.https.onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  try {
    const snapshot = await admin
      .firestore()
      .collection("projects")
      .where("userId", "==", auth.uid)
      .orderBy("createdAt", "desc")
      .get();

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { projects };
  } catch (error) {
    console.error("Error getting projects:", error);
    throw new functions.https.HttpsError("internal", "Error getting projects.");
  }
});

export const getProject = functions.https.onCall(async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { id } = data;

  if (typeof id !== "string" || id.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a " +
        'argument "id" which must be a non-empty string.'
    );
  }

  try {
    const doc = await admin.firestore().collection("projects").doc(id).get();

    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Project not found.");
    }

    const projectData = doc.data();

    if (!projectData) {
      throw new functions.https.HttpsError("not-found", "Project not found.");
    }

    if (projectData.userId !== auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to view this project."
      );
    }

    return { project: { id: doc.id, ...projectData } };
  } catch (error) {
    console.error("Error getting project:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Error getting project.");
  }
});

export const updateProject = functions.https.onCall(async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { id, ...projectUpdateData } = data;

  if (typeof id !== "string" || id.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a " +
        'argument "id" which must be a non-empty string.'
    );
  }

  const projectRef = admin.firestore().collection("projects").doc(id);

  try {
    const doc = await projectRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Project not found.");
    }

    if (doc.data()?.userId !== auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to update this project."
      );
    }

    await projectRef.update(projectUpdateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Error updating project.");
  }
});

export const deleteProject = functions.https.onCall(async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { id } = data;

  if (typeof id !== "string" || id.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a " +
        'argument "id" which must be a non-empty string.'
    );
  }

  const projectRef = admin.firestore().collection("projects").doc(id);

  try {
    const doc = await projectRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError("not-found", "Project not found.");
    }

    if (doc.data()?.userId !== auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to delete this project."
      );
    }

    await projectRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Error deleting project.");
  }
});
