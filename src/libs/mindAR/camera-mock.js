export const mockWithVideo = (path) => {
  navigator.mediaDevices.getUserMedia = () => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");

      video.oncanplay = () => {
      const startButton = document.createElement("button");
      startButton.innerHTML = "start";
      startButton.style.position = 'fixed';
      startButton.style.zIndex = 10000;
      startButton.style.top = '100px';
      document.body.appendChild(startButton);

      startButton.addEventListener('click', () => {
        const stream = video.captureStream();
        video.play();
        document.body.removeChild(startButton);
        resolve(stream);
      });
      };
          video.setAttribute('loop', '');
          video.setAttribute("src", path);
    });
  };
}

export const mockWithImage = (path) => {
  navigator.mediaDevices.getUserMedia = () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext('2d');
      const image = new Image();

      // Start butonu oluştur
      const startButton = document.createElement("button");
      startButton.innerHTML = "start";
      startButton.style.position = 'fixed';
      startButton.style.zIndex = 10000;
      document.body.appendChild(startButton);

      image.onload = () => {
        console.log('Image loaded successfully:', path);
        console.log('Image dimensions:', image.width, 'x', image.height);
        
        // Canvas boyutunu resim boyutuna göre ayarla
        canvas.width = image.width;
        canvas.height = image.height;

        startButton.addEventListener('click', () => {
          // Resmi canvas'a çiz
          context.drawImage(image, 0, 0, image.width, image.height);
          
          try {
            const stream = canvas.captureStream(30); // 30 FPS
            console.log('Stream created successfully:', stream);
            console.log('Stream tracks:', stream.getTracks());
            document.body.removeChild(startButton);
            resolve(stream);
          } catch (error) {
            console.error('Stream creation failed:', error);
            reject(error);
          }
        });
      }

      image.onerror = (error) => {
        console.error('Error loading image:', error);
        console.error('Image path was:', path);
        document.body.removeChild(startButton);
        reject(error);
      }

      // CORS hatasını önlemek için
      image.crossOrigin = "anonymous";
      
      console.log('Attempting to load image from:', path);
      image.src = path;
    });
  };
}
