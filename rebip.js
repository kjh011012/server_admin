import http from 'http';
import fetch from 'node-fetch';

const VULTR_API_KEY = 'WAFTXCFXTNDYUUOSENSWTXA4X23ZO5KOXY3Q';
const SERVER_PORT = 4441;
const main_ip = ['64.176.44.62', '141.164.52.4','141.164.54.214','45.76.219.63', '149.28.31.38','167.179.106.209','141.164.36.22'];




function rebootInstance(instanceId) {
  return fetch(`https://api.vultr.com/v2/instances/${instanceId}/reboot`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VULTR_API_KEY}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to reboot instance.');
      }
      
      console.log('Instance rebooted successfully.');
    })
    .catch((error) => {
      console.error(error);
    });
}

// HTTP 서버 생성
http.createServer((req, res) => {
  if (req.method === 'POST') {   // 인스턴스 재부팅 요청 처리 
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // 버퍼를 문자열로 변환
    });
    req.on('end', () => {
      const instanceId = body.split('=')[1];
      rebootInstance(instanceId)
      .then(() => {
        res.writeHead(302, { 'Location': '/' });
        res.end();
      })
      .catch((error) => {
        console.error(error);
        res.end('Error rebooting instance.');
      });
    });
  } else {  // 모든 인스턴스 데이터 반환 
    res.writeHead(200, { 'Content-Type':  'text/html; charset=utf-8' }); //하...........한글....
    fetch('https://api.vultr.com/v2/instances', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${VULTR_API_KEY}`,
      }
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to get instances.');
    }).then((data) => {
      const instances = [];
      data.instances.forEach((instance) => {
        if (instance.status === 'active' && main_ip.includes(instance.main_ip)) { // status가 active인 서버 정보만 추려냄
          instances.push({
            ip: instance.main_ip,
            memory: instance.ram,
            location: instance.region,
            status: instance.status,
            name: instance.tag,
            date_created : instance.date_created,
            id: instance.id
          });
        }
      });
      let tableHTML = `<table>`
      tableHTML += 
      `<style>

      table {
         border-collapse: collapse;
        width: 100%;
      }
    th, td {
      border: 1px solid black;
         padding: 8px;
         text-align: center;
       }
       th {
         background-color: #f2f2f2;
       }
       </style>
      <tr><th>IP 주소</th><th>위 치</th><th>메 모 리</th><th>이 름</th><th>상 태</th><th>생 성 일</th><th>재 부 팅</th></tr>`;
      instances.forEach((instance) => {
        tableHTML += `<tr>
        <td>${instance.ip}</td>
        <td>${instance.location}</td>
        <td>${instance.memory}</td>
        <td>${instance.name}</td>
        <td>${instance.status}
        <td>${instance.date_created}</td> 
        
        <td><form method="POST"  action="/reboot"><input type="hidden" name="instanceId"value="${instance.id}"><button>Restart</button></form></td></tr>`;
      });
      tableHTML +='</table>';
   

      res.end(tableHTML);
    }).catch((error) => {
      console.error(error);
      res.end('Error getting instances.');
    });
  }
}).listen(SERVER_PORT);



console.log(`Server listening on port ${SERVER_PORT}.`);
























// const rebootInstance = (instanceId) => {
//   return fetch(`https://api.vultr.com/v2/instances/${instanceId}/reboot`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${VULTR_API_KEY}`,
//     },
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error('Failed to reboot instance.');
//       }
      
//       console.log('Instance rebooted successfully.');
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

// const getInstanceInfo = () => {
//   return fetch('https://api.vultr.com/v2/instances', {
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${VULTR_API_KEY}`,
//     }
//   })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error('Failed to get instances.');
//     })
//     .then((data) => {
//       const instances = [];
//       data.instances.forEach((instance) => {
//         if (instance.status === 'active' && main_ip.includes(instance.main_ip)) { 
//           instances.push({
//             ip: instance.main_ip,
//             memory: instance.ram,
//             location: instance.region,
//             status: instance.status,
//             name: instance.tag,
//             date_created: instance.date_created,
//             id: instance.id
//           });
//         }
//       });
//       const generateTableHTML = (instances) => {
//         let tableHTML = `<head><style> 
//           table {
//             border-collapse: collapse;
//             width: 100%;
//           }
//           th, td {
//             border: 1px solid black;
//             padding: 8px;
//             text-align: left;
//           }
//           th {
//             background-color: #f2f2f2;
//           }
//           </style>
//         </head>
//         <body>
//           <table>
//             <thead>
//               <tr>
//                 <th>IP Address</th>
//                 <th>Region</th>
//                 <th>RAM</th>
//                 <th>Creation Date</th>
//                 <th>Status</th>
//                 <th>Label</th>
//                 <th>Power Status</th>
//               </tr>
//             </thead>`;
      
//         instances.forEach((instance) => {
//           tableHTML += `<tr>
//             <td>${instance.ip}</td>
//             <td>${instance.location}</td>
//             <td>${instance.memory}</td>
//             <td>${instance.name}</td>
//             <td>${instance.status}</td>
//             <td>${instance.date_created}</td>
//             <td><input type="text" action="/save" value="memo"></td>
//             <td><form method="POST" action="/reboot"><input type="hidden" name="instanceId" value="${instance.id}"><button>Restart</button></form></td>
//           </tr>`;
//         });
      
//         tableHTML += '</table></body>';
      
//         return tableHTML;
//       }}
//     ).catch((error) => {
//       console.error(error);
//       return 'Error getting instances.';
//     });
// }

// http.createServer((req, res) => {
//   if (req.method === 'POST') {
//     let body = '';
//     req.on('data', chunk => {
//       body += chunk.toString();
//     });
//     req.on('end', () => {
//       const instanceId = body.split('=')[1];
//       rebootInstance(instanceId)
//       .then(() => {
//         res.writeHead(302, { 'Location': '/' });
//         res.end();
//       });
//     })
//   }
// }).listen(SERVER_PORT, () => {
//   console.log(`Server listening on port ${SERVER_PORT}`);
// });