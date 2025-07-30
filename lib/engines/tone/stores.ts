function makeStore(init: any) {
    let store: any = init
    return {
        get: () => store,
        set: (value: any = null) => (store = value),
        update: (callback: (value: any) => any) => (store = callback(store)),
    };
}

export const onDisposeFns = makeStore([]);