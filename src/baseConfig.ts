export class PinataUrlBuilder {
  static #baseUrl = 'https://api.pinata.cloud';
  static #pinFileToIpfsEndpoint = '/pinning/pinFileToIPFS';
  static #dataPinListEndpoint = '/data/pinList';

  static get pinFileToIpfs(): string {
    return `${this.#baseUrl}${this.#pinFileToIpfsEndpoint}`;
  }
  static get dataPinList(): string {
    return `${this.#baseUrl}${this.#dataPinListEndpoint}`;
  }
}
