import { SerialPort, ReadlineParser } from "serialport";
import robot from "robotjs";

const SERIAL_PORT = '/dev/cu.usbmodem1301';
const BAUD_RATE = 9600;

const port = new SerialPort({
    path: SERIAL_PORT,
    baudRate: BAUD_RATE,
});

let readBaseStatus = false;
let mouseBase = { x: 0, y: 0 };
let updatingMousePos = false;

let deltaRange = {
    min: 0,
    max: 1024
}

const parser = (port as any).pipe(new ReadlineParser({ delimiter: '\n' }));

function getAcceleration(value: number, c: "x" | "y", base: {x: number, y: number}) {
    const diff = mouseBase[c] - value;
    const prop = Math.abs(diff) / (diff > 0 ? (deltaRange.max - base[c]) : base[c])
    return Math.round(Math.sin(prop) ** 2 * 1000) / 1000;
}

function moveMouse(dx: number, dy: number, click = false, base: {x: number, y: number}) {
    updatingMousePos = true;
    setTimeout(() => {
        let mouse = robot.getMousePos();

        // const ax = getAcceleration(dx, "x", base);
        // const ay = getAcceleration(dy, "y", base);

        // dy -= base.y;
        // dx -= base.x;

        // console.log(`dx: ${dx}, dy: ${dy}, ax: ${ax}, ay: ${ay}`);

        // let newX = mouse.x + dx * ax / 15;
        // let newY = mouse.y + dy * ay / 15;
        let newX = mouse.x + dx / 15;
        let newY = mouse.y + dy / 15;
        robot.moveMouse(newX, newY);

        if (click) {
            robot.mouseClick();
        }

        updatingMousePos = false;
    })
}

parser.on('data', (line: string) => {    
    const parts = line.trim().split(' ');
    
    if (parts.length === 3) {
        if(!readBaseStatus) {
            readBaseStatus = true;
            mouseBase = { x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) };
        }
        else{
            const dx = parseInt(parts[0], 10);
            const dy = parseInt(parts[1], 10);
            const click = parts[2] === '1';

            if(!updatingMousePos) moveMouse(dx, dy, click, mouseBase);
        }
    } else {
        console.error('Invalid data format. Expected format: "dx dy click"');
    }
});

(port as any).on('error', (err: any) => {
    console.error('Error: ', err.message);
});
