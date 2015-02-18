export class Annotation {
    constructor(name, targetCls) {
        this.name = name;
        this.targetCls = targetCls;
    }

    get injections() {
        return this.targetCls.injections || {};
    }

    get decorators() {
        return this.targetCls.decorators || [];
    }

    get dependencies() {
        return this.targetCls.dependencies || [];
    }
}
export default Annotation;
