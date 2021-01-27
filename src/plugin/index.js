import * as mixin from './mixin'
import 'simba-awesome-js'

export default {
    install(Vue, options = {}) {
        Vue.mixin(mixin(options));

    }

}