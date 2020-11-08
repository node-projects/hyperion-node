export enum HyperionType {
    Null = 0,
    Object = 1,
    Int64 = 2,
    Int16 = 3,
    Byte = 4,
    DateTime = 5,
    Bool = 6,
    String = 7,
    Int32 = 8,
    ByteArray = 9,
    DateTimeOffset = 10,
    Guid = 11,
    Float = 12,
    Double = 13,
    Decimal = 14,
    Char = 15,
    Type = 16,
    UInt16 = 17,
    UInt32 = 18,
    UInt64 = 19,
    SByte = 20,
    OwnType = 254,
}

interface IValueSerializer {
    deserialize(serializer: HyperionSerializer): any;
}

class NullSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        return null;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeBigInt64LE(value, offset);
    }
}

class Int64Serializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = Number(serializer.buffer.readBigInt64LE(serializer.offset));
        serializer.offset += 8;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeBigInt64LE(value, offset);
    }
}

class Int16Serializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = serializer.buffer.readInt16LE(serializer.offset);
        serializer.offset += 2;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeInt16LE(value, offset);
    }
}

class ByteSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = serializer.buffer.readUInt8(serializer.offset);
        serializer.offset += 1;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        //buffer.writeb(value, offset);
    }
}

class DateTimeSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let ticks = Number(serializer.buffer.readBigInt64LE(serializer.offset));
        let ticksToMicrotime = ticks / 10000;
        let epochMicrotimeDiff = 62135596800000;
        let tickDate = new Date(ticksToMicrotime - epochMicrotimeDiff);
        serializer.offset += 9;
        return tickDate;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        //buffer.writeb(value, offset);
    }
}

class BoolSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = serializer.buffer.readUInt8(serializer.offset);
        serializer.offset += 1;
        return value === 1;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        //buffer.writeb(value, offset);
    }
}

class StringSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let len = serializer.buffer.readUInt8(serializer.offset);
        serializer.offset += 1;
        if (len == 255) {
            len = serializer.buffer.readUInt32LE(serializer.offset);
            serializer.offset += 4;
        } else {
            len -= 1;
        }
        let value = serializer.buffer.toString('utf8', serializer.offset, serializer.offset + len);
        serializer.offset += len;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeInt32LE(value, offset);
    }
}

class Int32Serializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = serializer.buffer.readInt32LE(serializer.offset);
        serializer.offset += 4;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeInt32LE(value, offset);
    }
}

class GuidSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let guid = serializer.buffer[serializer.offset + 3].toString(16);
        guid += serializer.buffer[serializer.offset + 2].toString(16);
        guid += serializer.buffer[serializer.offset + 1].toString(16);
        guid += serializer.buffer[serializer.offset + 0].toString(16);
        guid += '-';
        guid += serializer.buffer[serializer.offset + 5].toString(16);
        guid += serializer.buffer[serializer.offset + 4].toString(16);
        guid += '-';
        guid += serializer.buffer[serializer.offset + 7].toString(16);
        guid += serializer.buffer[serializer.offset + 6].toString(16);
        guid += '-';
        guid += serializer.buffer[serializer.offset + 8].toString(16);
        guid += serializer.buffer[serializer.offset + 9].toString(16);
        guid += '-';
        guid += serializer.buffer[serializer.offset + 10].toString(16);
        guid += serializer.buffer[serializer.offset + 11].toString(16);
        guid += serializer.buffer[serializer.offset + 12].toString(16);
        guid += serializer.buffer[serializer.offset + 13].toString(16);
        guid += serializer.buffer[serializer.offset + 14].toString(16);
        guid += serializer.buffer[serializer.offset + 15].toString(16);
        serializer.offset += 16;
        return guid;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeInt32LE(value, offset);
    }
}

class FloatSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = serializer.buffer.readFloatLE(serializer.offset);
        serializer.offset += 4;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeFloatLE(value, offset);
    }
}

class DoubleSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let value = serializer.buffer.readDoubleLE(serializer.offset);
        serializer.offset += 8;
        return value;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        buffer.writeDoubleLE(value, offset);
    }
}

class CustomTypeSerializer implements IValueSerializer {
    deserialize(serializer: HyperionSerializer) {
        let typeId = serializer.buffer.readUInt16LE(serializer.offset);
        serializer.offset += 2;
        let d = serializer.customSerializers[typeId];
        if (!d)
            throw "Could not Find CustomTypeSerializer for TypeId: " + typeId;
        return d.deserialize(serializer);
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        //buffer.writeInt32BE(value, offset);
    }
}

export class CustomTypeSerializerT<T> implements IValueSerializer {
    ctor: new (...args: any[]) => T;
    properties: [name: string, typeId: number, nullable?: boolean][];

    constructor(TCtor: new (...args: any[]) => T, properties?: [name: string, typeId: number, nullable?: boolean][]) {
        this.ctor = TCtor;
        this.properties = properties;
    }
    deserialize(serializer: HyperionSerializer) {
        let obj = new this.ctor();
        if (Array.isArray(obj)) {
            let count = serializer.buffer.readUInt32LE(serializer.offset);
            serializer.offset += 4;
            for (let n = 0; n < count; n++)
                obj.push(serializer.deserializeInternal());
        }
        else {
            for (let c of this.properties) {
                if (c[1] === 254 || (c.length > 2 && c[2]))
                    obj[c[0]] = serializer.deserializeInternal();
                else
                    obj[c[0]] = serializer.serializers[c[1]].deserialize(serializer);
            }
        }
        return obj;
    }
    serialize(buffer: Buffer, offset: number, value: any) {
        //buffer.writeInt32BE(value, offset);
    }
    //get size() { return 4 };
}


export class HyperionSerializer {

    serializers: { [nr: number]: IValueSerializer };
    customSerializers: { [nr: number]: IValueSerializer };

    constructor() {
        this.serializers = {
            0: new NullSerializer(),
            2: new Int64Serializer(),
            3: new Int16Serializer(),
            4: new ByteSerializer(),
            5: new DateTimeSerializer(),
            6: new BoolSerializer(),
            7: new StringSerializer(),
            8: new Int32Serializer(),
            11: new GuidSerializer(),
            12: new FloatSerializer(),
            13: new DoubleSerializer(),
            254: new CustomTypeSerializer(),
        }
        this.customSerializers = {};
    }

    addCustomSerializer<T>(id: number, TCtor: new (...args: any[]) => T, properties?: [name: string, typeId: number, nullable?: boolean][]) {
        this.customSerializers[id] = new CustomTypeSerializerT<T>(TCtor, properties);
    }

    buffer: Buffer;
    offset: number;

    deserialize(buffer: Buffer) {
        this.buffer = buffer;
        this.offset = 0;
        return this.deserializeInternal();
    }

    deserializeInternal() {
        let code = this.buffer.readUInt8(this.offset);
        this.offset++;
        let d = this.serializers[code];
        return d.deserialize(this);
    }

    serialize(obj: any) {
        for (let o in this.customSerializers) {
            let s = this.customSerializers[o] as CustomTypeSerializerT<any>;
            if (obj instanceof s.ctor) {
                //s.serialize()
                break;
            }
        }
        //let a = new WritableStream();
        //a.getWriter().
        //this.offset = 0;
        //return this.serializeInternal();
    }

    serializeInternal() {
        /*let b = Buffer.
        let code = this.buffer.readUInt8(this.offset);
        this.offset++;
        let d = this.serializers[code];
        return d.deserialize(this);*/
    }
}
