import '../src/helper/stringExtensions';
import { HyperionSerializer, HyperionType } from '../src/HyperionDeserializer';

class Temp {
    SubArray: [] = [];
}

test('testHyperion', () => {
    const st = [254, 1, 0, 254, 0, 0, 3, 0, 0, 0, 8, 1, 0, 0, 0, 4, 2, 8, 3, 0, 0, 0];

    let buffer = Buffer.from(st);
    let h = new HyperionSerializer();
    h.addCustomSerializer<Temp>(1, Temp, [['SubArray', 254]]);
    h.addCustomSerializer<Array<object>>(0, Array);

    let a = h.deserialize(buffer);
    console.log(a);

    h.serialize(a);
});


test('testHyperion2', () => {
    //var msg = new Test1() { A = 98711111, B = new DateTime(2010, 5, 9), C = Guid.Parse("{A5AC6BA1-4F67-44A6-8B33-BD1F6A5A0DE0}"), D = "Hallo", E = 9.87, F = 88, G = null, H = 88, I = "Test2" };      
    const st = [254, 0, 0, 71, 54, 226, 5, 0, 0, 0, 0, 0, 0, 197, 179, 33, 189, 204, 8, 0, 161, 107, 172, 165, 103, 79, 166, 68, 139, 51, 189, 31, 106, 90, 13, 224, 6, 72, 97, 108, 108, 111, 61, 10, 215, 163, 112, 189, 35, 64, 88, 0, 0, 0, 0, 2, 88, 0, 0, 0, 0, 0, 0, 0, 6, 84, 101, 115, 116, 50];

    let buffer = Buffer.from(st);
    let h = new HyperionSerializer();
    h.addCustomSerializer(0, Object, [
        ['A', HyperionType.Int64], 
        ['B', HyperionType.DateTime], 
        ['C', HyperionType.Guid], 
        ['D', HyperionType.String], 
        ['E', HyperionType.Double], 
        ['F', HyperionType.Int32],
        ['G', HyperionType.Int64, true],
        ['H', HyperionType.Int64, true],
        ['I', HyperionType.String]]);

    let a = h.deserialize(buffer);
    console.log(a);
    
});
