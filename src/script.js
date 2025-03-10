import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import texture1 from './assets/textures/metalTexture.jpg';
//YENİ EKLENDİ
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { log } from 'three/tsl';

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAER3YxmQ3hUoDzPYNXspEpqaKNsGUsTh0",
    authDomain: "signcreator-b5903.firebaseapp.com",
    projectId: "signcreator-b5903",
    storageBucket: "signcreator-b5903.firebasestorage.app",
    messagingSenderId: "579459817287",
    appId: "1:579459817287:web:2ee77018e3e1a666f6f662",
    measurementId: "G-W8LLZ6KE88"
  };

// Firebase'i başlat (window.firebase kullanarak)
window.firebase.initializeApp(firebaseConfig);
const storage = window.firebase.storage();

// Texture yükleyici ve GUI oluştur
const textureLoader = new THREE.TextureLoader();
const gui = new GUI({ container: document.getElementById('custom-container') });

// GUI klasörleri
const signFolder = gui.addFolder('Tabela');
const logoFolder = gui.addFolder('Logo Ayarları');
const textFolder = gui.addFolder('Yazı');
const lightsFolder = gui.addFolder('Işıklar');

// Hazır texture listesi
const textureOptions = {
    none: null,
    brick: texture1,
    wood: './textures/wood.jpg',
    metal: './textures/metal.jpg'
};

// Texture seçimi için GUI kontrolü
const textureConfig = {
    selectedTexture: 'none',
    repeat: { x: 1, y: 1 },
    offset: { x: 0, y: 0 },
    rotation: 0,
    normalScale: { x: 1, y: 1 }
};

// GUI'ye texture seçimi ekle
signFolder.add(textureConfig, 'selectedTexture', Object.keys(textureOptions)).onChange((value) => {
    if (value === 'none') {
        sign.material.map = null;
        sign.material.needsUpdate = true;
        return;
    }
    
    textureLoader.load(textureOptions[value], (texture) => {
        texture.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
        texture.offset.set(textureConfig.offset.x, textureConfig.offset.y);
        texture.rotation = textureConfig.rotation;
        texture.encoding = THREE.sRGBEncoding;
        
        sign.material.map = texture;
        sign.material.needsUpdate = true;
    });
});

// Texture ayarları için GUI kontrolleri
const textureFolder = signFolder.addFolder('Texture Ayarları');
textureFolder.add(textureConfig.repeat, 'x', 0.1, 10).name('Repeat X').onChange(updateTextureRepeat);
textureFolder.add(textureConfig.repeat, 'y', 0.1, 10).name('Repeat Y').onChange(updateTextureRepeat);
textureFolder.add(textureConfig.offset, 'x', -1, 1).name('Offset X').onChange(updateTextureOffset);
textureFolder.add(textureConfig.offset, 'y', -1, 1).name('Offset Y').onChange(updateTextureOffset);
textureFolder.add(textureConfig, 'rotation', 0, Math.PI * 2).name('Rotation').onChange(updateTextureRotation);

// Texture güncelleme fonksiyonları
function updateTextureRepeat() {
    if (sign.material.map) {
        sign.material.map.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
        sign.material.map.needsUpdate = true;
    }
}

function updateTextureOffset() {
    if (sign.material.map) {
        sign.material.map.offset.set(textureConfig.offset.x, textureConfig.offset.y);
        sign.material.map.needsUpdate = true;
    }
}

function updateTextureRotation() {
    if (sign.material.map) {
        sign.material.map.rotation = textureConfig.rotation;
        sign.material.map.needsUpdate = true;
    }
}

// Texture yükleme işlemleri için event listener'lar
document.getElementById('uploadTextureButton').addEventListener('click', () => {
    document.getElementById('textureInput').click();
});

let currentLogoTexture = null;

document.getElementById('textureInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Mevcut logo texture'ını dispose et
            if (currentLogoTexture) {
                currentLogoTexture.dispose();
            }
            
            // Yeni logo texture'ını yükle
            currentLogoTexture = textureLoader.load(e.target.result, (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = true; // Logo texture'ının doğru yönde görünmesi için
                
                // Logo materyalini güncelle
                logo.material.map = texture;
                logo.material.transparent = false;
                logo.material.alphaTest = 0.5;
                logo.material.blending = THREE.NormalBlending;
                logo.material.opacity = 1;
                logo.material.color.set('#ffffff'); // Beyaz renk ayarı
                logo.material.needsUpdate = true;
                
                // GUI'ye logo texture kontrollerini ekle
                if (!logoFolder.__controllers.find(c => c.property === 'textureRepeatX')) {
                    const textureControls = {
                        textureRepeatX: 1,
                        textureRepeatY: 1,
                        textureRotation: 0,
                        textureOffsetX: 0,
                        textureOffsetY: 0
                    };
                    
                    logoFolder.add(textureControls, 'textureRepeatX', 0.1, 5).onChange((value) => {
                        texture.repeat.x = value;
                        texture.needsUpdate = true;
                    });
                    logoFolder.add(textureControls, 'textureRepeatY', 0.1, 5).onChange((value) => {
                        texture.repeat.y = value;
                        texture.needsUpdate = true;
                    });
                    logoFolder.add(textureControls, 'textureRotation', 0, Math.PI * 2).onChange((value) => {
                        texture.rotation = value;
                        texture.needsUpdate = true;
                    });
                    logoFolder.add(textureControls, 'textureOffsetX', -1, 1).onChange((value) => {
                        texture.offset.x = value;
                        texture.needsUpdate = true;
                    });
                    logoFolder.add(textureControls, 'textureOffsetY', -1, 1).onChange((value) => {
                        texture.offset.y = value;
                        texture.needsUpdate = true;
                    });
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

// Kontrol paneli için konfigürasyon objesi
const config = {
    // Tabela kontrolleri
    sign: {
        width: 6.5,
        height: 2,
        depth: 0.2,
        color: '#ff5900',
        shininess: 30,
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        position: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    logo: {
        color: '#ffffff',
        roughness: 0.5,
        metalness: 0.5,
        rotation: {
            x: Math.PI / 2,
            y: Math.PI / 2,
            z: 0
        },
        position: {
            x: -2.2,
            y: 0,
            z: 0.18
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        }
    },
    // Yazı kontrolleri
    text: {
        content: 'MARKET',
        size: 0.8,
        height: 0.01,
        color: '#ffffff',
        position: {
            x: 0.9,
            y: -0.3,
            z: 0.1
        },
        scale: {
            x: 1,
            y: 1,
            z: 0.005
        }
    },
    // Işık kontrolleri
    lights: {
        ambient: {
            intensity: 2,
            color: '#ffffff'
        },
        directional: {
            intensity: 1,
            color: '#ffffff',
            position: {
                x: 0,
                y: 5,
                z: 0
            }
        },
        point: {
            intensity: 0.5,
            color: '#ffffff',
            position: {
                x: 5,
                y: 5,
                z: 5
            }
        }
    }
};

// GUI kontrolleri
lightsFolder.addColor(config.lights.ambient, 'color').onChange(updateAmbientLight);
lightsFolder.add(config.lights.ambient, 'intensity', 0, 5).onChange(updateAmbientLight);
lightsFolder.addColor(config.lights.directional, 'color').onChange(updateDirectionalLight);
lightsFolder.add(config.lights.directional, 'intensity', 0, 5).onChange(updateDirectionalLight);
lightsFolder.addColor(config.lights.point, 'color').onChange(updatePointLight);
lightsFolder.add(config.lights.point, 'intensity', 0, 5).onChange(updatePointLight);

textFolder.add(config.text, 'content').onChange(updateText);
textFolder.add(config.text, 'size', 0.1, 2).onChange(updateText);
textFolder.add(config.text, 'height', 0.01, 0.5).onChange(updateText);
textFolder.addColor(config.text, 'color').onChange(updateTextMaterial);

// Scene oluştur
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x262626);

// Kamera oluştur
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Temel geometri ve mesh'leri oluştur
const signGeometry = new THREE.BoxGeometry(config.sign.width, config.sign.height, config.sign.depth);
const signMaterial = new THREE.MeshStandardMaterial({
    color: config.sign.color,
    metalness: 0.5,
    roughness: 0.5,
    side: THREE.DoubleSide
});
const sign = new THREE.Mesh(signGeometry, signMaterial);
scene.add(sign);

// Renderer oluştur
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio); // Pixel ratio ayarı

function updateRendererSize() {
    const container = document.getElementById('canvas-container');
    const containerHeight = window.innerWidth < 768 ? window.innerHeight * 0.5 : window.innerHeight;
    
    // Renderer boyutunu güncelle
    const width = container.clientWidth;
    const height = containerHeight;
    const needResize = renderer.domElement.width !== width || renderer.domElement.height !== height;
    
    if (needResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        console.log("Canvas boyutu güncellendi:", width, "x", height, "Pixel Ratio:", window.devicePixelRatio);
    }
    
    return needResize;
}

// İlk boyutlandırma
updateRendererSize();

// Pencere boyutu değiştiğinde güncelle
window.addEventListener('resize', updateRendererSize);

document.getElementById('canvas-container').appendChild(renderer.domElement);

// Orbit controls ekle
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Tabela Logosu için geometri oluşturma
const logoGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 32); // Çap: 0.7, Derinlik: 0.2
const logoMaterial = new THREE.MeshStandardMaterial({
    color: config.logo.color,
    roughness: 0.5,
    metalness: 0.5
});

// Logo geometrisini merkezde oluştur
logoGeometry.scale(1, 1, 1); // Başlangıç ölçeği 1 olsun, GUI ile kontrol edeceğiz

// Logo mesh'ini oluştur
const logo = new THREE.Mesh(logoGeometry, logoMaterial);

// Logo'yu istenen pozisyona taşı
logo.position.set(config.logo.position.x, config.logo.position.y, config.logo.position.z);
// Başlangıç scale değerlerini ayarla
logo.scale.set(config.logo.scale.x, config.logo.scale.y, config.logo.scale.z);
logo.rotation.set(
    config.logo.rotation.x,
    config.logo.rotation.y,
    config.logo.rotation.z
);

scene.add(logo);

//logo geometrisinin texture giydirilmemiş olanı
const logo2 = new THREE.Mesh(logoGeometry, logoMaterial);

// Logo'yu istenen pozisyona taşı
logo2.position.set(config.logo.position.x, config.logo.position.y, config.logo.position.z);
// Başlangıç scale değerlerini ayarla
logo2.scale.set(config.logo.scale.x, config.logo.scale.y, config.logo.scale.z);
logo2.rotation.set(
    config.logo.rotation.x,
    config.logo.rotation.y,
    config.logo.rotation.z
);
scene.add(logo2);

// Tabela kontrolleri
signFolder.add(config.sign, 'width', 1, 10).onChange(updateSignGeometry);
signFolder.add(config.sign, 'height', 1, 10).onChange(updateSignGeometry);
signFolder.add(config.sign, 'depth', 0.1, 2).onChange(updateSignGeometry);
signFolder.addColor(config.sign, 'color').onChange(updateSignMaterial);
signFolder.add(config.sign, 'shininess', 0, 100).onChange(updateSignMaterial);

// Logo kontrolleri
logoFolder.addColor(config.logo, 'color').onChange(updateLogoMaterial);
logoFolder.add(config.logo, 'roughness', 0, 1).onChange(updateLogoMaterial);
logoFolder.add(config.logo, 'metalness', 0, 1).onChange(updateLogoMaterial);

// Logo rotasyon kontrolleri
const logoRotationFolder = logoFolder.addFolder('Rotasyon');
logoRotationFolder.add(config.logo.rotation, 'x', -Math.PI, Math.PI).onChange(updateLogoRotation);
logoRotationFolder.add(config.logo.rotation, 'y', -Math.PI, Math.PI).onChange(updateLogoRotation);
logoRotationFolder.add(config.logo.rotation, 'z', -Math.PI, Math.PI).onChange(updateLogoRotation);

// Logo scale kontrolleri
const logoScaleFolder = logoFolder.addFolder('Scale');
logoScaleFolder.add(config.logo.scale, 'x', 0.1, 3).onChange(updateLogoScale);
logoScaleFolder.add(config.logo.scale, 'y', 0.1, 3).onChange(updateLogoScale);
logoScaleFolder.add(config.logo.scale, 'z', 0.1, 5).onChange(updateLogoScale);

// Logo pozisyon kontrolleri
const logoPositionFolder = logoFolder.addFolder('Pozisyon');
logoPositionFolder.add(config.logo.position, 'x', -5, 5).onChange(updateLogoPosition);
logoPositionFolder.add(config.logo.position, 'y', -5, 5).onChange(updateLogoPosition);
logoPositionFolder.add(config.logo.position, 'z', -5, 5).onChange(updateLogoPosition);

// Tabela pozisyon kontrolleri
const signPositionFolder = signFolder.addFolder('Pozisyon');
signPositionFolder.add(config.sign.position, 'x', -5, 5).onChange(updateSignPosition);
signPositionFolder.add(config.sign.position, 'y', -5, 5).onChange(updateSignPosition);
signPositionFolder.add(config.sign.position, 'z', -5, 5).onChange(updateSignPosition);

// Tabela rotasyon kontrolleri
const signRotationFolder = signFolder.addFolder('Rotasyon');
signRotationFolder.add(config.sign.rotation, 'x', -Math.PI, Math.PI).onChange(updateSignRotation);
signRotationFolder.add(config.sign.rotation, 'y', -Math.PI, Math.PI).onChange(updateSignRotation);
signRotationFolder.add(config.sign.rotation, 'z', -Math.PI, Math.PI).onChange(updateSignRotation);

// Yazı kontrolleri
// textFolder.add(config.text, 'content').onChange(updateText);
// textFolder.add(config.text, 'size', 0.1, 2).onChange(updateText);
// textFolder.add(config.text, 'height', 0.01, 0.5).onChange(updateText);
// textFolder.addColor(config.text, 'color').onChange(updateTextMaterial);

// Yazı pozisyon kontrolleri
const textPositionFolder = textFolder.addFolder('Pozisyon');
textPositionFolder.add(config.text.position, 'x', -5, 5).onChange(updateTextPosition);
textPositionFolder.add(config.text.position, 'y', -5, 5).onChange(updateTextPosition);
textPositionFolder.add(config.text.position, 'z', -5, 5).onChange(updateTextPosition);

// Yazı scale kontrolleri
const textScaleFolder = textFolder.addFolder('Scale');
textScaleFolder.add(config.text.scale, 'x', 0.1, 2).onChange(updateTextScale);
textScaleFolder.add(config.text.scale, 'y', 0.1, 2).onChange(updateTextScale);
textScaleFolder.add(config.text.scale, 'z', 0.001, 0.1).onChange(updateTextScale);

// Işık kontrolleri
// const lightsFolder = gui.addFolder('Işıklar');

// Ambient ışık kontrolleri
// const ambientLightFolder = lightsFolder.addFolder('Ambient Işık');
// ambientLightFolder.add(config.lights.ambient, 'intensity', 0, 2).onChange(updateAmbientLight);
// ambientLightFolder.addColor(config.lights.ambient, 'color').onChange(updateAmbientLight);

// Directional ışık kontrolleri
// const directionalLightFolder = lightsFolder.addFolder('Directional Işık');
// directionalLightFolder.add(config.lights.directional, 'intensity', 0, 2).onChange(updateDirectionalLight);
// directionalLightFolder.addColor(config.lights.directional, 'color').onChange(updateDirectionalLight);

// Point ışık kontrolleri
// const pointLightFolder = lightsFolder.addFolder('Point Işık');
// pointLightFolder.add(config.lights.point, 'intensity', 0, 2).onChange(updatePointLight);
// pointLightFolder.addColor(config.lights.point, 'color').onChange(updatePointLight);

// Update fonksiyonları
function updateSignGeometry() {
    const newGeometry = new THREE.BoxGeometry(
        config.sign.width,
        config.sign.height,
        config.sign.depth
    );
    sign.geometry.dispose();
    sign.geometry = newGeometry;
}

function updateSignMaterial() {
    sign.material.color.setStyle(config.sign.color);
    sign.material.shininess = config.sign.shininess;
    sign.material.needsUpdate = true;
}

function updateSignPosition() {
    sign.position.set(
        config.sign.position.x,
        config.sign.position.y,
        config.sign.position.z
    );
}

function updateSignRotation() {
    sign.rotation.set(
        config.sign.rotation.x,
        config.sign.rotation.y,
        config.sign.rotation.z
    );
}

function updateLogoMaterial() {
    logo.material.color.setStyle(config.logo.color);
    logo.material.roughness = config.logo.roughness;
    logo.material.metalness = config.logo.metalness;
    logo.material.needsUpdate = true;
}

function updateLogoRotation() {
    logo.rotation.set(
        config.logo.rotation.x,
        config.logo.rotation.y,
        config.logo.rotation.z
    );
}

function updateLogoScale() {
    logo.scale.set(config.logo.scale.x, config.logo.scale.y, config.logo.scale.z);
}

function updateLogoPosition() {
    logo.position.set(
        config.logo.position.x,
        config.logo.position.y,
        config.logo.position.z
    );
}

function updateText() {
    const textGeometry = new TextGeometry(config.text.content, {
        font: currentFont, // currentFont değişkenini font yüklendiğinde tanımlamalısınız
        size: config.text.size,
        height: config.text.height,
        // font: font,
        // size: 0.8,            // yazının boyutu
        // height: 0.01,         // derinliği çok küçük bir değere ayarladık
        curveSegments: 12,    // eğri kalitesi
        bevelEnabled: false,  // bevel'i kapattık
        bevelThickness: 0,    // bevel kalınlığı 0
        bevelSize: 0,         // bevel boyutu 0
        bevelOffset: 0,       // bevel offset'i 0
        bevelSegments: 0      // bevel segmentleri 0
    });
    
    const textMesh = sign.children[0];
    if (textMesh) {
        textMesh.geometry.dispose();
        textMesh.geometry = textGeometry;
        
        // Yazıyı yeniden merkeze hizala
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textMesh.position.x = -textWidth / 2;
    }
}

function updateTextMaterial() {
    const textMesh = sign.children[0];
    if (textMesh) {
        textMesh.material.color.setStyle(config.text.color);
        textMesh.material.needsUpdate = true;
    }
}

function updateTextPosition() {
    const textMesh = sign.children[0];
    if (textMesh) {
        textMesh.position.set(
            config.text.position.x,
            config.text.position.y,
            config.text.position.z
        );
    }
}

function updateTextScale() {
    const textMesh = sign.children[0];
    if (textMesh) {
        textMesh.scale.set(
            config.text.scale.x,
            config.text.scale.y,
            config.text.scale.z
        );
    }
}

function updateAmbientLight() {
    ambientLight.intensity = config.lights.ambient.intensity;
    ambientLight.color.setStyle(config.lights.ambient.color);
}

function updateDirectionalLight() {
    mainLight.intensity = config.lights.directional.intensity;
    mainLight.color.setStyle(config.lights.directional.color);
}

function updatePointLight() {
    pointLight.intensity = config.lights.point.intensity;
    pointLight.color.setStyle(config.lights.point.color);
}

// Font yükleme ve text oluşturma
let currentFont

const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    currentFont = font; // Global değişkene font'u kaydet
    const textGeometry = new TextGeometry(config.text.content, {
        font: font,
        size: config.text.size,
        height: config.text.height,
        // font: font,
        // size: 0.8,            // yazının boyutu
        // height: 0.01,         // derinliği çok küçük bir değere ayarladık
        curveSegments: 12,    // eğri kalitesi
        bevelEnabled: false,  // bevel'i kapattık
        bevelThickness: 0,    // bevel kalınlığı 0
        bevelSize: 0,         // bevel boyutu 0
        bevelOffset: 0,       // bevel offset'i 0
        bevelSegments: 0      // bevel segmentleri 0
    });
    
    const textMaterial = new THREE.MeshPhongMaterial({ 
        //color: 0xffffff,
        color: config.text.color,
        specular: 0x444444,
        shininess: 30,
        flatShading: true     // düz gölgeleme ekledik
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Scale ile derinliği kontrol et
    textMesh.scale.z = 0.005;  // Z ekseni boyunca ölçeklendirme
    
    // Yazıyı yeniden merkeze hizala
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = -textWidth + 25;
    textMesh.position.y = -0.3;
    textMesh.position.z = 0.1;  // tabelanın biraz önüne çıkardık

    textMesh.position.set(
        -textWidth / 2 + config.text.position.x,
        config.text.position.y,
        config.text.position.z
    );
    
    textMesh.scale.set(
        config.text.scale.x,
        config.text.scale.y,
        config.text.scale.z
    );
    
    sign.add(textMesh);
});

// Ana ışık kaynağı
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(0, 5, 0);
mainLight.target.position.set(0, 0, 0);
scene.add(mainLight);
scene.add(mainLight.target);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
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
    
    // Her frame'de boyut kontrolü
    if (updateRendererSize()) {
        console.log("Canvas yeniden boyutlandırıldı");
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Pencere yeniden boyutlandırma
// window.addEventListener('resize', onWindowResize, false);
// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }

// GLB export fonksiyonu
async function exportGLB() {
    console.log('GLB yükleniyor...');
    
    try {
        const timestamp = Date.now();
        const exportScene = new THREE.Scene();
        exportScene.background = scene.background;

        // Tabela kopyala
        const cubeCopy = sign.clone();
        exportScene.add(cubeCopy);
        
        // Logo kopyala
        const logoCopy = logo.clone();
        exportScene.add(logoCopy);
        
        // Işığı kopyala ve target'ı ayarla
        const lightCopy = mainLight.clone();
        const targetCopy = new THREE.Object3D();
        targetCopy.position.set(0, 0, 0);
        exportScene.add(targetCopy);
        lightCopy.target = targetCopy;
        exportScene.add(lightCopy);

        console.log('Model hazırlanıyor...');

        // GLB Exporter
        const exporter = new GLTFExporter();
        const glbData = await new Promise((resolve, reject) => {
            exporter.parse(
                exportScene,
                (result) => resolve(result),
                (error) => reject(error),
                { binary: true }
            );
        });

        console.log('Model dışa aktarıldı, Firebase\'e yükleniyor...');
        document.getElementById('exportButton').innerText = 'Model Yükleniyor...';
        document.getElementById('exportButton').disabled = true;

        // Firebase Storage'a GLB yükle
        const storageRef = window.firebase.storage().ref();
        const glbPath = `models/${timestamp}_model.glb`;
        const glbRef = storageRef.child(glbPath);
        await glbRef.put(new Blob([glbData]));

        console.log('GLB yüklendi:', glbPath);
        
        // GLB dosyasını public yap
        const glbUrl = await glbRef.getDownloadURL();
        console.log('Model URL hazır:', glbUrl);
        
        // AR viewer'a yönlendir
        window.location.href = `ar-viewer.html?glb=${encodeURIComponent(glbPath)}`;
    } catch (error) {
        console.error('Export hatası:', error);
        alert('Export işlemi sırasında bir hata oluştu: ' + error.message);
    }
}

// Export butonlarına event listener ekle
const exportButton = document.getElementById('exportButton');
const exportUsdzButton = document.getElementById('exportUsdzButton');

if (exportButton) {
    exportButton.addEventListener('click', exportGLB);
} else {
    console.error('Export butonu bulunamadı!');
}

if (exportUsdzButton) {
    exportUsdzButton.addEventListener('click', exportGLB);
} else {
    console.error('Export USDZ butonu bulunamadı!');
}
