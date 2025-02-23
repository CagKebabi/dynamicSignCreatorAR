import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';

// Scene oluştur
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// Camera oluştur
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer oluştur
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls ekle
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Tabela için geometri oluşturma
const signGeometry = new THREE.BoxGeometry(5, 2, 0.2);
const signMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2244aa,
    specular: 0x555555,
    shininess: 30 
});
const sign = new THREE.Mesh(signGeometry, signMaterial);
scene.add(sign);

// Font yükleme ve text oluşturma
// const loader = new FontLoader();
// loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
//     const textGeometry = new TextGeometry('MARKET', {
//         font: font,
//         size: 0.8,
//         height: 0.05,  // Derinliği azalttık
//         curveSegments: 12,
//         bevelEnabled: true,
//         bevelThickness: 0.01,  // Bevel kalınlığını azalttık
//         bevelSize: 0.01,      // Bevel boyutunu azalttık
//         bevelSegments: 3
//     });
    
//     const textMaterial = new THREE.MeshPhongMaterial({ 
//         color: 0xffffff,
//         specular: 0x444444
//     });
//     const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
//     // Yazıyı merkeze hizalama
//     textGeometry.computeBoundingBox();
//     const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
//     textMesh.position.x = -textWidth / 2;
//     textMesh.position.y = -0.3;
//     textMesh.position.z = 0;
    
//     sign.add(textMesh);
// });

const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const textGeometry = new TextGeometry('MARKET', {
        font: font,
        size: 0.8,            // yazının boyutu
        height: 0.01,         // derinliği çok küçük bir değere ayarladık
        curveSegments: 12,    // eğri kalitesi
        bevelEnabled: false,  // bevel'i kapattık
        bevelThickness: 0,    // bevel kalınlığı 0
        bevelSize: 0,         // bevel boyutu 0
        bevelOffset: 0,       // bevel offset'i 0
        bevelSegments: 0      // bevel segmentleri 0
    });
    
    const textMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        specular: 0x444444,
        shininess: 30,
        flatShading: true     // düz gölgeleme ekledik
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Scale ile derinliği kontrol et
    textMesh.scale.z = 0.005;  // Z ekseni boyunca ölçeklendirme
    
    // Yazıyı merkeze hizalama
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = -textWidth / 2;
    textMesh.position.y = -0.3;
    textMesh.position.z = 0.1;  // tabelanın biraz önüne çıkardık
    
    sign.add(textMesh);
});

// Ana ışık kaynağı
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(0, 5, 0);
mainLight.target.position.set(0, 0, 0);
scene.add(mainLight);
scene.add(mainLight.target);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
//scene.add(ambientLight.target);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);
//scene.add(pointLight.target);

// Küp oluştur
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshStandardMaterial({ 
//     color: 0x00ff00,
//     metalness: 0.3,
//     roughness: 0.4 
// });
// const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

// Animasyon döngüsü
function animate() {
    requestAnimationFrame(animate);
    //sign.rotation.x += 0.01;
    //sign.rotation.y += 0.01;
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Pencere yeniden boyutlandırma
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// GLB export fonksiyonu
async function exportGLB() {
    try {
        console.log('Export başlatılıyor...');
        
        // Yeni bir scene oluştur
        const exportScene = new THREE.Scene();
        console.log('Export scene oluşturuldu');
        
        // Küpü kopyala
        const cubeCopy = sign.clone();
        exportScene.add(cubeCopy);
        console.log('Küp kopyalandı ve eklendi');
        
        // Işığı kopyala ve target'ı ayarla
        const lightCopy = mainLight.clone();
        const targetCopy = new THREE.Object3D();
        targetCopy.position.set(0, 0, -1);
        lightCopy.target = targetCopy;
        lightCopy.add(targetCopy);
        exportScene.add(lightCopy);
        console.log('Işık kopyalandı ve eklendi');

        // GLTFExporter oluştur
        const exporter = new GLTFExporter();
        console.log('Exporter oluşturuldu');

        // Promise olarak export işlemini yap
        const glbData = await new Promise((resolve, reject) => {
            exporter.parse(
                exportScene,
                (result) => {
                    if (result instanceof ArrayBuffer) {
                        console.log('Export başarılı, buffer boyutu:', result.byteLength);
                        resolve(result);
                    } else {
                        reject(new Error('Export edilen veri ArrayBuffer değil'));
                    }
                },
                (error) => {
                    console.error('Export hatası:', error);
                    reject(error);
                },
                { binary: true }
            );
        });

        // Dosyayı kaydet
        const blob = new Blob([glbData], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sign.glb';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Dosya indirme başlatıldı');

    } catch (error) {
        console.error('Export işlemi sırasında hata:', error);
        alert('GLB export işlemi sırasında bir hata oluştu: ' + error.message);
    }
}

// Export butonunu bul ve event listener ekle
const exportButton = document.getElementById('exportButton');
if (exportButton) {
    exportButton.addEventListener('click', exportGLB);
    console.log('Export butonu event listener eklendi');
} else {
    console.error('Export butonu bulunamadı!');
}



