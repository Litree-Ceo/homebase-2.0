"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.createProject = functions.https.onCall(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { name, description, url, sourceCodeUrl, tags, imageUrl, status } = data;
    if (!(typeof name === "string") || name.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a " +
            'argument "name" which must be a non-empty string.');
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
    }
    catch (error) {
        console.error("Error creating project:", error);
        throw new functions.https.HttpsError("internal", "Error creating project.");
    }
});
exports.getProjects = functions.https.onCall(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const snapshot = await admin
            .firestore()
            .collection("projects")
            .where("userId", "==", auth.uid)
            .orderBy("createdAt", "desc")
            .get();
        const projects = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return { projects };
    }
    catch (error) {
        console.error("Error getting projects:", error);
        throw new functions.https.HttpsError("internal", "Error getting projects.");
    }
});
exports.getProject = functions.https.onCall(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { id } = data;
    if (typeof id !== "string" || id.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a " +
            'argument "id" which must be a non-empty string.');
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
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to view this project.");
        }
        return { project: Object.assign({ id: doc.id }, projectData) };
    }
    catch (error) {
        console.error("Error getting project:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error getting project.");
    }
});
exports.updateProject = functions.https.onCall(async (request) => {
    var _a;
    const { data, auth } = request;
    if (!auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { id } = data, projectUpdateData = __rest(data, ["id"]);
    if (typeof id !== "string" || id.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a " +
            'argument "id" which must be a non-empty string.');
    }
    const projectRef = admin.firestore().collection("projects").doc(id);
    try {
        const doc = await projectRef.get();
        if (!doc.exists) {
            throw new functions.https.HttpsError("not-found", "Project not found.");
        }
        if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to update this project.");
        }
        await projectRef.update(projectUpdateData);
        return { success: true };
    }
    catch (error) {
        console.error("Error updating project:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error updating project.");
    }
});
exports.deleteProject = functions.https.onCall(async (request) => {
    var _a;
    const { data, auth } = request;
    if (!auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { id } = data;
    if (typeof id !== "string" || id.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a " +
            'argument "id" which must be a non-empty string.');
    }
    const projectRef = admin.firestore().collection("projects").doc(id);
    try {
        const doc = await projectRef.get();
        if (!doc.exists) {
            throw new functions.https.HttpsError("not-found", "Project not found.");
        }
        if (((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.userId) !== auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to delete this project.");
        }
        await projectRef.delete();
        return { success: true };
    }
    catch (error) {
        console.error("Error deleting project:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error deleting project.");
    }
});
//# sourceMappingURL=projects.js.map