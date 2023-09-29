export class LoggerService {
    public log() {
        const message = 'Hello from logger service';
        return process.server ? console.log(message) : alert(message);
    }
}
