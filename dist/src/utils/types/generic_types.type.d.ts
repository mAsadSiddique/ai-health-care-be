export type FileType = {
    index?: string;
    name?: string;
    key?: string;
    url?: string;
    mimeType?: string;
};
export type callbackType = (error: Error, destination: boolean) => void;
export type ObjectType = Record<string, any>;
