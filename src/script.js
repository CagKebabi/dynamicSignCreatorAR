import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import texture1 from './assets/textures/metalTexture.jpg';
//YENİ EKLENDİ
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { log } from 'three/tsl';

// Texture yükleyici
const textureLoader = new THREE.TextureLoader();

// Hazır texture listesi
const textureOptions = {
    none: null,
    wood: texture1,
    // wood: './assets/textures/metalTexture.jpg',
    metal: '/textures/metal.jpg',
    plastic: '/textures/plastic.jpg',
    // Daha fazla texture ekleyebilirsiniz
};

// Texture ayarları için konfigürasyon
const textureConfig = {
    currentTexture: 'none',
    repeat: {
        x: 1,
        y: 1
    },
    offset: {
        x: 0,
        y: 0
    },
    rotation: 0,
    transparent: false,
    opacity: 1.0,
    // Normal map ayarları
    useNormalMap: false,
    normalMap: 'none',
    normalScale: {
        x: 1,
        y: 1
    },
    // Roughness map ayarları
    useRoughnessMap: false,
    roughnessMap: 'none',
    roughness: 0.5,
    // Metalness ayarları
    useMetalnessMap: false,
    metalnessMap: 'none',
    metalness: 0.5
};

// Kontrol paneli için konfigürasyon objesi
const config = {
    // Tabela kontrolleri
    sign: {
        width: 5,
        height: 2,
        depth: 0.2,
        color: '#2244aa',
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
    // Yazı kontrolleri
    text: {
        content: 'MARKET',
        size: 0.8,
        height: 0.01,
        color: '#ffffff',
        position: {
            x: 0,
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
            intensity: 0.5,
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

// GUI oluştur
const gui = new GUI();

// GUI'ye texture kontrollerini ekle
function addTextureControls(gui, material) {
    const textureFolder = gui.addFolder('Texture Ayarları');

    // Texture seçimi
    textureFolder.add(textureConfig, 'currentTexture', Object.keys(textureOptions))
        .name('Texture')
        .onChange((value) => {
            if (value === 'none') {
                material.map = null;
            } else {
                textureLoader.load(textureOptions[value], (texture) => {
                    material.map = texture;
                    // Mevcut repeat ve offset değerlerini uygula
                    texture.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
                    texture.offset.set(textureConfig.offset.x, textureConfig.offset.y);
                    texture.rotation = textureConfig.rotation;
                    material.needsUpdate = true;
                });
            }
        });

    // Repeat kontrolü
    const repeatFolder = textureFolder.addFolder('Repeat');
    repeatFolder.add(textureConfig.repeat, 'x', 0.1, 10).onChange(updateTextureRepeat);
    repeatFolder.add(textureConfig.repeat, 'y', 0.1, 10).onChange(updateTextureRepeat);

    // Offset kontrolü
    const offsetFolder = textureFolder.addFolder('Offset');
    offsetFolder.add(textureConfig.offset, 'x', -1, 1).onChange(updateTextureOffset);
    offsetFolder.add(textureConfig.offset, 'y', -1, 1).onChange(updateTextureOffset);

    // Rotation kontrolü
    textureFolder.add(textureConfig, 'rotation', 0, Math.PI * 2)
        .onChange(updateTextureRotation);

    // Transparency kontrolü
    textureFolder.add(textureConfig, 'transparent')
        .onChange((value) => {
            material.transparent = value;
            material.needsUpdate = true;
        });

    textureFolder.add(textureConfig, 'opacity', 0, 1)
        .onChange((value) => {
            material.opacity = value;
            material.needsUpdate = true;
        });

    // Normal map kontrolü
    const normalMapFolder = textureFolder.addFolder('Normal Map');
    normalMapFolder.add(textureConfig, 'useNormalMap')
        .onChange((value) => {
            if (!value) {
                material.normalMap = null;
            } else if (textureConfig.normalMap !== 'none') {
                loadNormalMap(textureConfig.normalMap);
            }
            material.needsUpdate = true;
        });

    normalMapFolder.add(textureConfig, 'normalMap', Object.keys(textureOptions))
        .onChange((value) => {
            if (textureConfig.useNormalMap && value !== 'none') {
                loadNormalMap(value);
            }
        });

    const normalScaleFolder = normalMapFolder.addFolder('Normal Scale');
    normalScaleFolder.add(textureConfig.normalScale, 'x', 0, 2)
        .onChange((value) => {
            if (material.normalMap) {
                material.normalScale.x = value;
            }
        });
    normalScaleFolder.add(textureConfig.normalScale, 'y', 0, 2)
        .onChange((value) => {
            if (material.normalMap) {
                material.normalScale.y = value;
            }
        });

    // Roughness kontrolü
    const roughnessFolder = textureFolder.addFolder('Roughness');
    roughnessFolder.add(textureConfig, 'useRoughnessMap')
        .onChange((value) => {
            if (!value) {
                material.roughnessMap = null;
            } else if (textureConfig.roughnessMap !== 'none') {
                loadRoughnessMap(textureConfig.roughnessMap);
            }
            material.needsUpdate = true;
        });

    roughnessFolder.add(textureConfig, 'roughnessMap', Object.keys(textureOptions))
        .onChange((value) => {
            if (textureConfig.useRoughnessMap && value !== 'none') {
                loadRoughnessMap(value);
            }
        });

    roughnessFolder.add(textureConfig, 'roughness', 0, 1)
        .onChange((value) => {
            material.roughness = value;
            material.needsUpdate = true;
        });

    // Metalness kontrolü
    const metalnessFolder = textureFolder.addFolder('Metalness');
    metalnessFolder.add(textureConfig, 'useMetalnessMap')
        .onChange((value) => {
            if (!value) {
                material.metalnessMap = null;
            } else if (textureConfig.metalnessMap !== 'none') {
                loadMetalnessMap(textureConfig.metalnessMap);
            }
            material.needsUpdate = true;
        });

    metalnessFolder.add(textureConfig, 'metalnessMap', Object.keys(textureOptions))
        .onChange((value) => {
            if (textureConfig.useMetalnessMap && value !== 'none') {
                loadMetalnessMap(value);
            }
        });

    metalnessFolder.add(textureConfig, 'metalness', 0, 1)
        .onChange((value) => {
            material.metalness = value;
            material.needsUpdate = true;
        });
}

// Texture güncelleme fonksiyonları
function updateTextureRepeat() {
    if (material.map) {
        material.map.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
        material.map.needsUpdate = true;
    }
}

function updateTextureOffset() {
    if (material.map) {
        material.map.offset.set(textureConfig.offset.x, textureConfig.offset.y);
        material.map.needsUpdate = true;
    }
}

function updateTextureRotation() {
    if (material.map) {
        material.map.rotation = textureConfig.rotation;
        material.map.needsUpdate = true;
    }
}

// Map yükleme fonksiyonları
function loadNormalMap(mapName) {
    textureLoader.load(textureOptions[mapName], (texture) => {
        material.normalMap = texture;
        material.normalScale.set(textureConfig.normalScale.x, textureConfig.normalScale.y);
        material.needsUpdate = true;
    });
}

function loadRoughnessMap(mapName) {
    textureLoader.load(textureOptions[mapName], (texture) => {
        material.roughnessMap = texture;
        material.needsUpdate = true;
    });
}

function loadMetalnessMap(mapName) {
    textureLoader.load(textureOptions[mapName], (texture) => {
        material.metalnessMap = texture;
        material.needsUpdate = true;
    });
}

//---------------------------------

// Tabela kontrolleri
const signFolder = gui.addFolder('Tabela');
signFolder.add(config.sign, 'width', 1, 10).onChange(updateSignGeometry);
signFolder.add(config.sign, 'height', 1, 10).onChange(updateSignGeometry);
signFolder.add(config.sign, 'depth', 0.1, 2).onChange(updateSignGeometry);
signFolder.addColor(config.sign, 'color').onChange(updateSignMaterial);
signFolder.add(config.sign, 'shininess', 0, 100).onChange(updateSignMaterial);

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
const textFolder = gui.addFolder('Yazı');
textFolder.add(config.text, 'content').onChange(updateText);
textFolder.add(config.text, 'size', 0.1, 2).onChange(updateText);
textFolder.add(config.text, 'height', 0.01, 0.5).onChange(updateText);
textFolder.addColor(config.text, 'color').onChange(updateTextMaterial);

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
const lightsFolder = gui.addFolder('Işıklar');

// Ambient ışık kontrolleri
const ambientLightFolder = lightsFolder.addFolder('Ambient Işık');
ambientLightFolder.add(config.lights.ambient, 'intensity', 0, 2).onChange(updateAmbientLight);
ambientLightFolder.addColor(config.lights.ambient, 'color').onChange(updateAmbientLight);

// Directional ışık kontrolleri
const directionalLightFolder = lightsFolder.addFolder('Directional Işık');
directionalLightFolder.add(config.lights.directional, 'intensity', 0, 2).onChange(updateDirectionalLight);
directionalLightFolder.addColor(config.lights.directional, 'color').onChange(updateDirectionalLight);

// Point ışık kontrolleri
const pointLightFolder = lightsFolder.addFolder('Point Işık');
pointLightFolder.add(config.lights.point, 'intensity', 0, 2).onChange(updatePointLight);
pointLightFolder.addColor(config.lights.point, 'color').onChange(updatePointLight);

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

function updateText() {
    const textGeometry = new TextGeometry(config.text.content, {
        font: currentFont, // currentFont değişkenini font yüklendiğinde tanımlamalısınız
        size: config.text.size,
        height: config.text.height,
        curveSegments: 12,
        bevelEnabled: false
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
// const signMaterial = new THREE.MeshPhongMaterial({ 
//     color: 0x2244aa,
//     specular: 0x555555,
//     shininess: 30
// });
const material = new THREE.MeshBasicMaterial({ 
    color: config.sign.color,
    roughness: textureConfig.roughness,
    metalness: textureConfig.metalness
});
const sign = new THREE.Mesh(signGeometry, material);
scene.add(sign);

// GUI'ye texture kontrollerini ekle
addTextureControls(gui, material);

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

let currentFont

const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    currentFont = font; // Global değişkene font'u kaydet
    const textGeometry = new TextGeometry('MARKET', {
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
    
    // Yazıyı merkeze hizalama
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = -textWidth / 2;
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
                    localStorage.setItem('glbFile',result)
                    if (result instanceof ArrayBuffer) {
                        console.log('Export başarılı, buffer boyutu:', result.byteLength);
                        resolve(result);
                        console.log(localStorage.getItem('glbFile'));
                        
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



