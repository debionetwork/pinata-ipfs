import axios from 'axios';
import { uploadFile, downloadJson, getIpfsMetaData } from '../../src';
import { PinataUrlBuilder } from '../../src/baseConfig';
import NodeFormData from './form-data.mock';
import fetchMock from 'fetch-mock';

describe('Pinata IPFS Unit Tests', () => {
  describe('uploadFile function', () => {
    const ENDPOINT = PinataUrlBuilder.pinFileToIpfs;
    const FORM_DATA_MOCK: NodeFormData = new NodeFormData();

    const axiosSpy = jest.spyOn(axios, 'post');
    const axiosCancelTokenSourceSpy = jest.spyOn(axios.CancelToken, 'source');

    beforeEach(() => {
      axiosSpy.mockClear();
      axiosCancelTokenSourceSpy.mockClear();
    });

    it('uploadFile should return', async () => {
      // Arrange
      const JWT = 'JWT';
      const BLOB = 'BLOB';
      const OPTIONS = {
        pinataMetadata: {
          name: 'NAME',
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const PROMISE_RESOLVE = {
        status: 200,
        data: 'DATA',
      };
      FORM_DATA_MOCK.append('file', BLOB);
      FORM_DATA_MOCK.append('pinataMetadata', JSON.stringify(OPTIONS.pinataMetadata));
      FORM_DATA_MOCK.append('pinataOptions', JSON.stringify(OPTIONS.pinataOptions));
      axiosSpy.mockReturnValue(Promise.resolve(PROMISE_RESOLVE));

      // Act
      const RES = await uploadFile(OPTIONS, BLOB as any, JWT);

      // Assert
      expect(RES).toEqual(PROMISE_RESOLVE.data);
      expect(axiosCancelTokenSourceSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledWith(ENDPOINT, FORM_DATA_MOCK, {
        withCredentials: true,
        maxContentLength: 'Infinity' as any,
        maxBodyLength: 'Infinity' as any,
        headers: {
          'Content-type': `multipart/form-data; boundary= ${FORM_DATA_MOCK._boundary}`,
          authorization: `Bearer ${JWT}`,
        },
        onUploadProgress: expect.any(Function),
        cancelToken: axios.CancelToken.source().token,
      });
    });

    it('uploadFile should reject', async () => {
      // Arrange
      const JWT = 'JWT';
      const BLOB = 'BLOB';
      const OPTIONS = {
        pinataMetadata: {
          name: 'NAME',
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const PROMISE_RESOLVE = {
        status: 500,
        data: 'DATA',
      };
      FORM_DATA_MOCK.append('file', BLOB);
      FORM_DATA_MOCK.append('pinataMetadata', JSON.stringify(OPTIONS.pinataMetadata));
      FORM_DATA_MOCK.append('pinataOptions', JSON.stringify(OPTIONS.pinataOptions));
      axiosSpy.mockReturnValue(Promise.resolve(PROMISE_RESOLVE));

      // Assert
      expect(uploadFile(OPTIONS, BLOB as any, JWT)).rejects.toThrowError(
        new Error(`Unknown server response while pinning File to IPFS: ${PROMISE_RESOLVE}`),
      );
      expect(axiosCancelTokenSourceSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledWith(ENDPOINT, FORM_DATA_MOCK, {
        withCredentials: true,
        maxContentLength: 'Infinity' as any,
        maxBodyLength: 'Infinity' as any,
        headers: {
          'Content-type': `multipart/form-data; boundary= ${FORM_DATA_MOCK._boundary}`,
          authorization: `Bearer ${JWT}`,
        },
        onUploadProgress: expect.any(Function),
        cancelToken: axios.CancelToken.source().token,
      });
    });

    it('uploadFile should catch and reject', async () => {
      // Arrange
      const JWT = 'JWT';
      const BLOB = 'BLOB';
      const OPTIONS = {
        pinataMetadata: {
          name: 'NAME',
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      FORM_DATA_MOCK.append('file', BLOB);
      FORM_DATA_MOCK.append('pinataMetadata', JSON.stringify(OPTIONS.pinataMetadata));
      FORM_DATA_MOCK.append('pinataOptions', JSON.stringify(OPTIONS.pinataOptions));
      axiosSpy.mockReturnValue(Promise.reject(new Error('PROMISE_RESOLVE')));

      // Assert
      await expect(uploadFile(OPTIONS, BLOB as any, JWT)).rejects.toThrow('PROMISE_RESOLVE');
      expect(axiosCancelTokenSourceSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledWith(ENDPOINT, FORM_DATA_MOCK, {
        withCredentials: true,
        maxContentLength: 'Infinity' as any,
        maxBodyLength: 'Infinity' as any,
        headers: {
          'Content-type': `multipart/form-data; boundary= ${FORM_DATA_MOCK._boundary}`,
          authorization: `Bearer ${JWT}`,
        },
        onUploadProgress: expect.any(Function),
        cancelToken: axios.CancelToken.source().token,
      });
    });
  });

  describe('downloadJson function', () => {
    beforeEach(() => {
      fetchMock.reset();
    });

    it('downloadJson should return', async () => {
      // Arrange
      const IPFS_URL = PinataUrlBuilder.dataPinList;
      const EXPECTED_RESULT = { result: 'EXPECTED_RESULT' };

      fetchMock.get(IPFS_URL, EXPECTED_RESULT);

      // Act
      const RES = await downloadJson(IPFS_URL);

      // Assert
      expect(RES).toEqual({
        data: EXPECTED_RESULT,
      });
    });

    it('downloadJson should return withMetadata', async () => {
      // Arrange
      const CID = 'CID';
      const JWT = 'JWT';
      const IPFS_URL = `${PinataUrlBuilder.dataPinList}/${CID}`;
      const METADATA_RESULT = {
        rows: [
          {
            metadata: {
              name: 'NAME',
              keyvalues: {
                type: 'TYPE',
              },
            },
          },
        ],
      };
      const EXPECTED_RESULT = { result: 'EXPECTED_RESULT' };

      fetchMock.get(`${PinataUrlBuilder.dataPinList}?status=pinned&hashContains=${CID}`, METADATA_RESULT);

      fetchMock.get(IPFS_URL, EXPECTED_RESULT);

      // Act
      const RES = await downloadJson(IPFS_URL, true, JWT);

      // Assert
      expect(RES).toEqual({
        data: EXPECTED_RESULT,
        name: 'NAME',
        type: 'TYPE',
      });
    });

    it('downloadJson should throw parameter error', async () => {
      // Arrange
      const IPFS_URL = PinataUrlBuilder.dataPinList;
      const EXPECTED_ERROR = 'pinataJwtKey parameter is required if withMetadata is set to true';

      // Act
      expect(downloadJson(IPFS_URL, true)).rejects.toThrow(EXPECTED_ERROR);
    });
  });

  describe('getIpfsMetaData function', () => {
    beforeEach(() => {
      fetchMock.reset();
    });

    it('getIpfsMetaData should return', async () => {
      // Arrange
      const CID = 'CID';
      const JWT = 'JWT';
      const EXPECTED_RESULT = { result: 'EXPECTED_RESULT' };

      fetchMock.get(`${PinataUrlBuilder.dataPinList}?status=pinned&hashContains=${CID}`, EXPECTED_RESULT);

      // Act
      const RES = await getIpfsMetaData(CID, JWT);

      // Assert
      expect(RES).toEqual(EXPECTED_RESULT);
    });
  });
});
