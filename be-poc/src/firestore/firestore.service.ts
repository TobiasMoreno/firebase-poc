import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;

  onModuleInit() {
    if (!admin.apps.length) {
      // Para desarrollo local, usar service account key
      // Para producción en Firebase Functions/Cloud Run, usar Application Default Credentials
      const serviceAccountPath = path.join(
        process.cwd(),
        'firebase-service-account.json',
      );

      if (fs.existsSync(serviceAccountPath)) {
        // Desarrollo local: usar archivo de credenciales
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8'),
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Alternativa: usar variable de entorno
        const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Producción: usar Application Default Credentials
        admin.initializeApp();
      }
    }
    this.firestore = admin.firestore();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  // Métodos de ejemplo para usar Firestore
  async getCollection(
    collectionName: string,
  ): Promise<Array<Record<string, unknown>>> {
    const snapshot = await this.firestore.collection(collectionName).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<
      Record<string, unknown>
    >;
  }

  async getDocument(
    collectionName: string,
    docId: string,
  ): Promise<Record<string, unknown> | null> {
    const doc = await this.firestore
      .collection(collectionName)
      .doc(docId)
      .get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Record<string, unknown>;
  }

  async createDocument(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<string> {
    const docRef = await this.firestore.collection(collectionName).add(data);
    return docRef.id;
  }

  async updateDocument(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>,
  ) {
    await this.firestore.collection(collectionName).doc(docId).update(data);
  }

  async deleteDocument(collectionName: string, docId: string) {
    await this.firestore.collection(collectionName).doc(docId).delete();
  }

  async queryCollection(
    collectionName: string,
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: unknown,
  ): Promise<Array<Record<string, unknown>>> {
    const snapshot = await this.firestore
      .collection(collectionName)
      .where(field, operator, value)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<
      Record<string, unknown>
    >;
  }
}
