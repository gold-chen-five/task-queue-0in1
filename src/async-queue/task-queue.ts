const queue: (() => Promise<void>)[] = [];

export function enqueue(task: () => Promise<void>) {
    queue.push(task);
}

export function dequeue(): (() => Promise<void>) | undefined {
    if(isEmpty()) return undefined;
    return queue.shift();
}

export function isEmpty() {
    return queue.length === 0;
}

export async function processQueue() {
    if(isEmpty()) return;

    const task = dequeue();
    if(!task) return;

    try {
        await task();
    } catch(e) {
        console.error(e);            
    }
    
    processQueue();
}