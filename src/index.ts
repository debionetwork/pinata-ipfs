import 'isomorphic-fetch';
import axios from 'axios';
import NodeFormData from 'form-data';
import { PinataUrlBuilder } from './baseConfig';

export function uploadFile(
  pinataApiOptions: any,
  file: Blob,
  pinataJwtKey: string,
  cancelToken: any = null,
  onProgressFunction: (progress) => void = null,
) {
  return new Promise((resolve, reject) => {
    const data: any = new NodeFormData();
    data.append('file', file);

    if (cancelToken == null) {
      const CancelToken = axios.CancelToken;
      cancelToken = CancelToken.source();
    }

    if (pinataApiOptions) {
      if (pinataApiOptions.pinataMetadata) {
        data.append('pinataMetadata', JSON.stringify(pinataApiOptions.pinataMetadata));
      }
      if (pinataApiOptions.pinataOptions) {
        data.append('pinataOptions', JSON.stringify(pinataApiOptions.pinataOptions));
      }
    }

    axios
      .post(PinataUrlBuilder.pinFileToIpfs, data, {
        withCredentials: true,
        maxContentLength: 'Infinity' as any,
        maxBodyLength: 'Infinity' as any,
        headers: {
          'Content-type': `multipart/form-data; boundary= ${data._boundary}`,
          authorization: `Bearer ${pinataJwtKey}`,
        },
        onUploadProgress: (progressEvent) => onProgressFunction(progressEvent),
        cancelToken: cancelToken.token,
      })
      .then((result) => {
        if (result.status !== 200) {
          reject(new Error(`Unknown server response while pinning File to IPFS: ${result}`));
        }
        resolve(result.data);
      })
      .catch((error) => reject(error));
  });
}

export async function downloadJson(ipfsLink, withMetaData = false, pinataJwtKey = null): Promise<any> {
  const cid = ipfsLink.split('/').pop();
  const response = await fetch(new URL(ipfsLink).toString());
  const data = await response.json();
  let metadata;

  if (withMetaData) {
    if (pinataJwtKey == null) {
      throw new Error('pinataJwtKey parameter is required if withMetadata is set to true');
    }

    const { rows } = await getIpfsMetaData(cid, pinataJwtKey);

    metadata = {
      name: rows[0].metadata.name,
      type: rows[0].metadata.keyvalues.type,
    };
  }

  return { ...(withMetaData ? metadata : null), data };
}

export async function getIpfsMetaData(cid, pinataJwtKey) {
  const listResponse = await fetch(`${PinataUrlBuilder.dataPinList}?status=pinned&hashContains=${cid}`, {
    headers: {
      authorization: `Bearer ${pinataJwtKey}`,
    },
  });

  return await listResponse.json();
}

export const downloadDocumentFileInBrowser = (data: any, fileName: string, type: string) => {
  const blob = new Blob([data], { type });
  const a = document.createElement('a');

  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  a.click();
};
