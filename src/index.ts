import { baseUrl, gateway, pinFileToIpfsEndpoint } from "./baseConfig"
import axios, { AxiosRequestHeaders } from "axios"
import Kilt from "@kiltprotocol/sdk-js"
import NodeFormData from "form-data"

interface IPair {
  publicKey: string,
  secretKey: string
}

export const uploadFile = (pinataApiOptions: any, file: Blob, headers: AxiosRequestHeaders) => {
  return new Promise((resolve, reject) => {
    const data = new NodeFormData()
    const endpoint = `${baseUrl}${pinFileToIpfsEndpoint}`

    data.append("file", file)

    if (pinataApiOptions.pinataMetadata) data.append("pinataMetadata", JSON.stringify(pinataApiOptions.pinataMetadata))
    if (pinataApiOptions.pinataOptions) data.append("pinataOptions", JSON.stringify(pinataApiOptions.pinataOptions))

    axios.post(endpoint, data, {
      withCredentials: true,
      maxContentLength: "Infinity" as any, // NOTE: Allow axios to upload large file
      maxBodyLength: "Infinity" as any,
      headers
    }).then(result => {
      if (result.status !== 200) reject(new Error(`unknown server response while pinning File to IPFS: ${result}`))
      else resolve(result.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getFileUrl = (cid: string) => {
  return `${gateway}${cid}`
}

export const downloadFile = async (ipfsLink: string) => {
  console.log("Downloading...")

  const response = await fetch(ipfsLink)
  const data = await response.json()

  console.log("Success Downloaded!")

  return data
}

export const decryptFile = (obj: any, pair: IPair, type: string) => {
  const box: any = Object.values(obj[0].data.box)
  const nonce: any = Object.values(obj[0].data.nonce)
  let decryptedFile: any

  const toDecrypt = {
    box: Uint8Array.from(box),
    nonce: Uint8Array.from(nonce)
  }

  if (type === "application/pdf") decryptedFile = Kilt.Utils.Crypto.decryptAsymmetric(toDecrypt, pair.publicKey, pair.secretKey)
  else decryptedFile = Kilt.Utils.Crypto.decryptAsymmetricAsStr(toDecrypt, pair.publicKey, pair.secretKey)

  if (!decryptedFile) console.log("Undefined File", decryptedFile)
  else return decryptedFile
}

export const downloadDocumentFile = (data: any, fileName: string, type: string) => {
  try {
    const blob = new Blob([data], { type })
    const a = document.createElement("a")

    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
  } catch (error) {
    console.error(error)
  }
}
