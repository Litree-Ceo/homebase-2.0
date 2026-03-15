import { db } from '../../firebase/client';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export async function get({ params, request }) {
    try {
        const q = query(collection(db, "network-status"), orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        const latestStatus = querySnapshot.docs[0].data();

        return new Response(JSON.stringify(latestStatus), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        console.error("Error getting document: ", e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}