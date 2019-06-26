
interface System {
    start(): void;
    update(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    dispose(): void;
    exit(): void;
    render?(): void;
}