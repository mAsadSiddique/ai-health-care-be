// { [key: string]: any } is same as Record<string, any>
// Partial is used to make optional Partial<Type>
// Omit is used to exclude the attribute Omit<Type, Field>
// Pick is used to pick the specific attribute Pick<Type, Field>
// we can also use union in type like ==> type data = number | string
// we can also use intersection in type like ==> type data = usertype & dataType

export type FileType = {
	index?: string
	name?: string
	key?: string
	url?: string
	mimeType?: string
}

export type callbackType = (error: Error, destination: boolean) => void
export type ObjectType = Record<string, any>
