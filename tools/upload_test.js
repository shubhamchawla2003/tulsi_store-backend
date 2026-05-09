import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

(async () => {
  const filePath = './uploads/test.png';
  if (!fs.existsSync(filePath)) {
    // write tiny PNG
    fs.writeFileSync(filePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=', 'base64'));
  }
  const fd = new FormData();
  fd.append('image', fs.createReadStream(filePath));

  try {
    const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: fd });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERR', err.message);
  }
})();
