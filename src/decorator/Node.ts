import 'reflect-metadata'

const NODE_METADATA_KEY = 'neo:node'


export function Node(label: string) {
    return function(target: any) {
        Reflect.defineMetadata(NODE_METADATA_KEY, label, target)
    }
}

export function getNodeLabel(target: any): string {
    return Reflect.getMetadata(NODE_METADATA_KEY, target)
}
