import net from "net";
import { jest } from "@jest/globals";
import InMemoryDBClient from "@/database/db-client";
import { IProtocol, ProtocolCode, TResponse } from "@/database/protocol.type";
import { EMethod } from "@/database/protocol.type";
import Protocol from "@/database/protocol";
import { Console } from "console";

jest.mock("net");

describe("InMemoryDBClient", () => {
    let client: InMemoryDBClient;
    let protocol: IProtocol;
    let mockSocket: jest.Mocked<net.Socket>;

    beforeEach(() => {
        mockSocket = {
            write: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
            end: jest.fn(),
            connect: jest.fn(),
            destroy: jest.fn(),
        } as unknown as jest.Mocked<net.Socket>;

        (net.createConnection as jest.Mock<any>).mockImplementation((_port: number, _host: string, callback?:() => void) => {
            if(callback) callback();
            return mockSocket;
        });

        protocol = new Protocol()
        client = new InMemoryDBClient(protocol);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function mockNetResponse(code: ProtocolCode, message: string){
        mockSocket.write.mockReturnValue(true);
        const buffer = protocol.encodeResponse(code, message);
        mockSocket.once.mockImplementationOnce((event: string, callback: (...args: any[]) => void) => {
            if (event === "data") {
                callback(buffer);
            }
            return mockSocket;
        });
    }

    describe("parseUrl(valid)", () => {
        it("should parse valid URLs", () => {
            const result = client.parseUrl("inmemory://localhost:1234");
            expect(result).toEqual({ host: "localhost", port: 1234 });
        });
    });

    describe("parseUrl(invalid)", () => {
        it("should throw an error for an invalid protocol", () => {
            expect(() => client.parseUrl("http://localhost:1234"))
                .toThrow("Invalid protocol, Only inmemory:// is supported.");
        });

        it("should throw an error for invalid url", () => {
            expect(() => client.parseUrl("inmemory"))
                .toThrow();
        });

        it("should throw an error for no hostname", () => {
            expect(() => client.parseUrl("inmemory://"))
                .toThrow("Need to provide hostname");
        });

        it("should throw an error for no port", () => {
            expect(() => client.parseUrl("inmemory://hostname"))
                .toThrow("Need to provide port");
        });
    });

    describe("connect", () => {
        it("should connect success", async () => {
            const result = await client.connect("inmemory://localhost:1234");
            expect(result).toBe("connected to in-memory db at inmemory://localhost:1234");
        });

        it("should retun error",() => {
            expect(() => client.connect("inmemory://localhost:"))
                .toThrow("Need to provide port")
        });
    })

    describe("send", () => {
        it("should return fail for no connected", async () => {
            await expect(() => client.send(Buffer.from("test")))
                .rejects
                .toThrow("Not connected to any server");
        });

        it("should return fail when return isSucess is false", async () => {
            await client.connect("inmemory://localhost:8080");
            mockSocket.write.mockReturnValue(false);
            await expect(() => client.send(Buffer.from("test")))
                .rejects
                .toThrow("Failed to write message to server");
        });

        it("should return TResponse when success", async () => {
            const buffer = Buffer.from("test");
            mockNetResponse(ProtocolCode.OK, "test");

            // act
            await client.connect("inmemory://localhost:8080");
            const res = await client.send(buffer);

            // assert
            expect(res.code).toBe(ProtocolCode.OK);
            expect(res.message).toBe("test");
        });
    })

    test("toStringList", () => {
        const buffer = Buffer.from("test\\test2");
        const buffer2 = Buffer.from("testtest2");

        const bufferArr = client.toStringList(buffer);
        const bufferArr2 = client.toStringList(buffer2);

        expect(bufferArr[0]).toBe("test");
        expect(bufferArr[1]).toBe("test2");
        expect(bufferArr2[0]).toBe("testtest2");
    })

    test("parseResponseString", () => {
        const res: TResponse = {
            code: ProtocolCode.OK,
            message: "test",
            data: Buffer.from("test")
        }

        const r = client.parseResponseString(res);

        expect(r.data).toBe("test");
    })

    test("parseResponseStringList", () => {
        const res: TResponse = {
            code: ProtocolCode.OK,
            message: "test",
            data: Buffer.from("test\\test2\\test3")
        };

        const r = client.parseResponseList(res);

        expect(r.data).toEqual(["test", "test2", "test3"]);
    })
    
    describe("InMemoryDBClient - operation", () => {
        test("get", async () => {
            // arrange
            const tKey = "test";
            mockNetResponse(ProtocolCode.OK, "test");
           
            // act
            await client.connect("inmemory://localhost:8080");
            const response = await client.get(tKey);

            // assert
            expect(response).toEqual({
                code: ProtocolCode.OK,
                message: "test",
                data: Buffer.from("")
            });
        })

        test("set", async () => {
            // arrange
            const tKey = "test";
            const tValue = "test"
            mockNetResponse(ProtocolCode.OK, "test");
           
            // act
            await client.connect("inmemory://localhost:8080");
            const response = await client.set(tKey, tValue);

            // assert
            expect(response).toEqual({
                code: ProtocolCode.OK,
                message: "test",
                data: Buffer.from("")
            });
        })
    });

    describe("listenChannel", () => {
        it("should send right data when protocolCode is Subscribe", async () => {
            // arrange 
            const buffer = protocol.encodeResponse(ProtocolCode.SUBSCRIBE, "channel send", Buffer.from("test"));
            mockSocket.on.mockImplementation((event: string, callback: (...args: any[]) => void) => {
                if (event === "data") {
                    callback(buffer);
                }
                return mockSocket;
            })
            const testFunction = jest.fn(() => {});

            // act
            await client.connect("inmemory://localhost:8080");
            client.listenChannel(testFunction);

            // assert
            expect(testFunction).toHaveBeenCalled();
            expect(testFunction).toHaveBeenCalledWith("test");
        })

        it("should handle error if not connect", async () => {
            // arrange 
            const testFunction = jest.fn(() => {});

            // assert
            expect(() => client.listenChannel(testFunction))
                .toThrow("Not connected to any server")
        })

        it("shouldn't run the callback when protocolCode isn't Subscribe", async () => {
            // arrange 
            const buffer = protocol.encodeResponse(ProtocolCode.OK, "channel send", Buffer.from("test"));
            mockSocket.on.mockImplementation((event: string, callback: (...args: any[]) => void) => {
                if (event === "data") {
                    callback(buffer);
                }
                return mockSocket;
            })
            const testFunction = jest.fn(() => {});

            // act
            await client.connect("inmemory://localhost:8080");
            client.listenChannel(testFunction);

            // assert
            expect(testFunction).not.toHaveBeenCalled();
        })

    });
});
