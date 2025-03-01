/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fs = require("fs");
const os = require("os");
const path = require("path");
const fetch = require("node-fetch");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.convertToUSDZ = functions.runWith({
  timeoutSeconds: 300,
  memory: "1GB",
}).storage.object().onFinalize(async (object) => {
  // Sadece GLB dosyalarını işle
  if (!object.name.endsWith(".glb")) return null;
  
  // Eğer dosya zaten dönüştürülmüş bir GLB ise işleme
  if (object.name.startsWith("optimized_models/")) return null;

  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(object.name);
  const tempFilePath = path.join(os.tmpdir(), path.basename(object.name));
  const usdzFileName = path.basename(object.name).replace(".glb", ".usdz");
  const usdzTempPath = path.join(os.tmpdir(), usdzFileName);

  try {
    // GLB dosyasını geçici dizine indir
    await bucket.file(object.name).download({
      destination: tempFilePath,
    });

    // GLB dosyasını public yap
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${object.name}`;

    // Model Viewer API'sine GET isteği yap
    const response = await fetch(
      `https://modelviewer.dev/api/convert/gltf2usdz?url=${encodeURIComponent(publicUrl)}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`USDZ dönüşümü başarısız oldu: ${await response.text()}`);
    }

    // USDZ dosyasını geçici dizine kaydet
    const usdzBuffer = await response.buffer();
    fs.writeFileSync(usdzTempPath, usdzBuffer);

    // USDZ dosyasını Firebase Storage'a yükle
    const usdzFile = bucket.file(`models/${usdzFileName}`);
    await usdzFile.save(usdzBuffer, {
      metadata: {
        contentType: "model/vnd.usdz+zip",
      },
    });

    // USDZ dosyasını da public yap
    await usdzFile.makePublic();

    // Geçici dosyaları temizle
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(usdzTempPath);

    console.log(`${object.name} başarıyla USDZ'ye dönüştürüldü ve yüklendi`);
    return null;
  } catch (error) {
    console.error("USDZ dönüşüm hatası:", error);
    throw error;
  }
});
