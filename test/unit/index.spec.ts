import axios from "axios";
import { uploadFile } from "../../src";
import { baseUrl, pinFileToIpfsEndpoint } from "../../src/baseConfig";
import NodeFormData from "./form-data.mock";

describe('Pinata IPFS Upload File', () => {
  const ENDPOINT = `${baseUrl}${pinFileToIpfsEndpoint}`;
  const FORM_DATA_MOCK: NodeFormData = new NodeFormData();

  const axiosSpy = jest.spyOn(axios, 'post');
  
  beforeEach(() => {
    axiosSpy.mockClear();
  });

  it('uploadFile should return', async () => {
      // Arrange
      const JWT = "JWT";
      const BLOB = "BLOB";
      const OPTIONS = {
        pinataMetadata: {
          name: "NAME"
        },
        pinataOptions: {
          cidVersion: 0
        }
      };
      const PROMISE_RESOLVE = {
        status: 200,
        data: "DATA"
      };
      FORM_DATA_MOCK.append("file", BLOB);
      FORM_DATA_MOCK.append("pinataMetadata", JSON.stringify(OPTIONS.pinataMetadata));
      FORM_DATA_MOCK.append("pinataOptions", JSON.stringify(OPTIONS.pinataOptions));
      axiosSpy.mockReturnValue(Promise.resolve(PROMISE_RESOLVE));

      // Act
      const RES = await uploadFile(OPTIONS, BLOB as any, JWT);

      // Assert
      expect(RES).toEqual(PROMISE_RESOLVE.data);
      expect(axiosSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledWith(
        ENDPOINT,
        FORM_DATA_MOCK,
        {
          withCredentials: true,
          maxContentLength: "Infinity" as any,
          maxBodyLength: "Infinity" as any,
          headers: {
            "Content-type": `multipart/form-data; boundary= ${FORM_DATA_MOCK._boundary}`,
            "authorization": `Bearer ${JWT}`
          }
        }
      );
  });

  it('uploadFile should reject', async () => {
      // Arrange
      const JWT = "JWT";
      const BLOB = "BLOB";
      const OPTIONS = {
        pinataMetadata: {
          name: "NAME"
        },
        pinataOptions: {
          cidVersion: 0
        }
      };
      const PROMISE_RESOLVE = {
        status: 500,
        data: "DATA"
      };
      FORM_DATA_MOCK.append("file", BLOB);
      FORM_DATA_MOCK.append("pinataMetadata", JSON.stringify(OPTIONS.pinataMetadata));
      FORM_DATA_MOCK.append("pinataOptions", JSON.stringify(OPTIONS.pinataOptions));
      axiosSpy.mockReturnValue(Promise.resolve(PROMISE_RESOLVE));

      // Assert
      expect(uploadFile(OPTIONS, BLOB as any, JWT)).rejects.toThrowError(new Error(`Unknown server response while pinning File to IPFS: ${PROMISE_RESOLVE}`));
      expect(axiosSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledWith(
        ENDPOINT,
        FORM_DATA_MOCK,
        {
          withCredentials: true,
          maxContentLength: "Infinity" as any,
          maxBodyLength: "Infinity" as any,
          headers: {
            "Content-type": `multipart/form-data; boundary= ${FORM_DATA_MOCK._boundary}`,
            "authorization": `Bearer ${JWT}`
          }
        }
      );
  });

  it('uploadFile should catch and reject', async () => {
      // Arrange
      const JWT = "JWT";
      const BLOB = "BLOB";
      const OPTIONS = {
        pinataMetadata: {
          name: "NAME"
        },
        pinataOptions: {
          cidVersion: 0
        }
      };
      FORM_DATA_MOCK.append("file", BLOB);
      FORM_DATA_MOCK.append("pinataMetadata", JSON.stringify(OPTIONS.pinataMetadata));
      FORM_DATA_MOCK.append("pinataOptions", JSON.stringify(OPTIONS.pinataOptions));
      axiosSpy.mockReturnValue(Promise.reject(new Error("PROMISE_RESOLVE")));

      // Assert
      await expect(uploadFile(OPTIONS, BLOB as any, JWT)).rejects.toThrow("PROMISE_RESOLVE");
      expect(axiosSpy).toBeCalledTimes(1);
      expect(axiosSpy).toBeCalledWith(
        ENDPOINT,
        FORM_DATA_MOCK,
        {
          withCredentials: true,
          maxContentLength: "Infinity" as any,
          maxBodyLength: "Infinity" as any,
          headers: {
            "Content-type": `multipart/form-data; boundary= ${FORM_DATA_MOCK._boundary}`,
            "authorization": `Bearer ${JWT}`
          }
        }
      );
  });
});
