import {defineStore} from "pinia";

interface State {
    hello: string;
}

export const useRegularStore = defineStore('regular', {
    state: (): State => ({
        hello: 'world'
    })
})
