const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { saveAs } = require('file-saver');

// 임시
const { dialog } = require('@electron/remote');

// 파일 디렉토리 읽기
// document.getElementById('load-files').addEventListener('click', () => {
//   const directoryPath = document.getElementById('directory-path').value;
//   const fileListElement = document.getElementById('file-list');

//   fs.readdir(directoryPath, (err, files) => {
//     if (err) {
//       console.error('Could not list the directory.', err);
//       return;
//     }

//     fileListElement.innerHTML = '';

//     files.forEach((file) => {
//       const li = document.createElement('li');
//       const input = document.createElement('input');
//       input.type = 'text';
//       input.value = file;
//       input.defaultValue = file; // 기본값 설정
//       li.appendChild(input);
//       fileListElement.appendChild(li);
//     });
//   });
// });

// 파일 이름 변경 기능
// document.getElementById('rename-files').addEventListener('click', () => {
//   console.log('Rename button clicked'); // 디버깅용 로그

//   const directoryPath = document.getElementById('directory-path').value;
//   const fileListElement = document.getElementById('file-list');
//   const inputs = fileListElement.getElementsByTagName('input');

//   console.log('inputs', inputs);

//   Array.from(inputs).forEach((input, index) => {
//     const oldFileName = input.defaultValue;
//     const newFileName = input.value;

//     // console.log(`Renaming ${oldFilePath} to ${newFilePath}`); // 디버깅용 로그

//     if (oldFileName !== newFileName) {
//       const oldFilePath = path.join(directoryPath, oldFileName);
//       const newFilePath = path.join(directoryPath, newFileName);

//       fs.rename(oldFilePath, newFilePath, (err) => {
//         if (err) {
//           console.error(
//             `Error renaming file ${oldFileName} to ${newFileName}`,
//             err
//           );
//         } else {
//           console.log(`Successfully renamed ${oldFileName} to ${newFileName}`); // 디버깅용 로그
//         }
//       });
//     }
//   });
// });

document.getElementById('select-directory').addEventListener('click', () => {
  dialog
    .showOpenDialog({
      properties: ['openDirectory'],
    })
    .then((result) => {
      if (!result.canceled) {
        document.getElementById('directory-path').value = result.filePaths[0];
      }
    })
    .catch((err) => {
      console.error('Failed to select directory:', err);
    });
});

// 엑셀 파일 생성 기능 추가
// console.log(window.electron);
document.getElementById('load-files').addEventListener('click', () => {
  const directoryPath = document.getElementById('directory-path').value;
  console.log('directoryPath', directoryPath);

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err);
      return;
    }

    console.log('files', files);
    const fileListElement = document.getElementById('file-list');
    fileListElement.innerHTML = '';

    // 엑셀 파일 생성
    const wb = XLSX.utils.book_new();
    const ws_data = [['Before', 'After Filename', 'After Extension']];
    files.forEach((file) => {
      // ws_data.push([file, file]);
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      ws_data.push([file, name, ext]);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Files');

    // 엑셀 파일 저장
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'files.xlsx');
  });
});

// // 파일 업로드 기능
document.getElementById('upload-file').addEventListener('click', () => {
  const fileInput = document.getElementById('file-upload');
  const directoryPath = document.getElementById('directory-path').value;

  if (!fileInput.files.length) {
    console.error('No file selected');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets['Files'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    rows.slice(1).forEach((row) => {
      const oldFileName = row[0];
      const newFileName = row[1];
      const newFileExt = row[2];
      if (oldFileName && newFileName && newFileExt) {
        const oldFilePath = path.join(directoryPath, oldFileName);
        const newFilePath = path.join(directoryPath, newFileName + newFileExt);
        if (oldFileName && newFileName && oldFileName !== newFileName) {
          fs.rename(oldFilePath, newFilePath, (err) => {
            if (err) {
              console.error(`[Error] ${oldFileName} to ${newFileName}`, err);
            } else {
              console.log(`[Success] ${oldFileName} to ${newFileName}`);
            }
          });
        }
      }
    });
  };
  reader.readAsArrayBuffer(file);
});
