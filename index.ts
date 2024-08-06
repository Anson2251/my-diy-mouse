import { SerialPort, ReadlineParser } from "serialport";
import robot from "robotjs";

const SERIAL_PORT = '/dev/cu.usbmodem1301';
const BAUD_RATE = 9600;

const port = new SerialPort({
    path: SERIAL_PORT,
    baudRate: BAUD_RATE,
});

let updatingMousePos = false;

const parser = (port as any).pipe(new ReadlineParser({ delimiter: '\n' }));

function moveMouse(dx: number, dy: number, click = false) {
    updatingMousePos = true;
    setTimeout(() => {
        let mouse = robot.getMousePos();

        let newX = mouse.x + dx / 15;
        let newY = mouse.y + dy / 15;

        robot.moveMouse(newX, newY);
        if (click) robot.mouseClick();

        updatingMousePos = false;
    })
}

parser.on('data', (line: string) => {    
    const parts = line.trim().split(' ');
    
    if (parts.length === 3) {
        const dx = parseInt(parts[0], 10);
        const dy = parseInt(parts[1], 10);
        const click = parts[2] === '1';

        if(!updatingMousePos) moveMouse(dx, dy, click);
    } else {
        console.error('Invalid data format. Expected format: "dx dy click"');
    }
});

(port as any).on('error', (err: any) => {
    console.error('Error: ', err.message);
});
