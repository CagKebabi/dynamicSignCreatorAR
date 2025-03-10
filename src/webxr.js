// WebXR API ile AR oturumunu başlatan bir işlev
document.getElementById('start-ar').addEventListener('click', async () => {
    if (navigator.xr) {
        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test']  // Hit Test özelliğini kullanarak gerçek dünya ile etkileşim
            });
            // AR oturumunu başlat
            const xrCanvas = document.createElement('canvas');
            xrCanvas.width = window.innerWidth;
            xrCanvas.height = window.innerHeight;
            document.body.appendChild(xrCanvas);
            
            // WebXR için XRSession ve XRFrame kullanımı
            const gl = xrCanvas.getContext('webgl', { xrCompatible: true });
            const renderer = new THREE.WebGLRenderer({ canvas: xrCanvas, context: gl });
            renderer.xr.enabled = true;
            
            // Sahne oluşturma
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera();
            
            // Basit bir küp ekleyelim
            const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            
            // Etkileşim için animasyon döngüsü
            function animate() {
                renderer.setAnimationLoop(animate);
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                renderer.render(scene, camera);
            }
            animate();
            
            // WebXR ile etkileşimi başlat
            session.requestReferenceSpace('local').then((refSpace) => {
                const onXRFrame = (time, frame) => {
                    const session = frame.session;
                    const pose = frame.getViewerPose(refSpace);
                    if (pose) {
                        // Bu alanda kamera ve kullanıcı etkileşimleri işlenebilir
                        camera.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                    }
                };
                session.requestAnimationFrame(onXRFrame);
            });
            
        } catch (error) {
            console.error('AR oturumu başlatılamadı:', error);
        }
    } else {
        alert('WebXR desteklenmiyor!');
    }
});