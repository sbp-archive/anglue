import {ApplicationAnnotation} from './application';
import {ComponentAnnotation} from './component';
import {StoreAnnotation} from './store';
import {ActionsAnnotation} from './actions';

export class AnnotationsFactory {
  getApplication(name, targetCls) {
    return new ApplicationAnnotation(name, targetCls);
  }

  getComponent(name, targetCls) {
    return new ComponentAnnotation(name, targetCls);
  }

  getStore(name, targetCls) {
    return new StoreAnnotation(name, targetCls);
  }

  getActions(name, targetCls) {
    return new ActionsAnnotation(name, targetCls);
  }
}

export var Annotations = new AnnotationsFactory();
export default Annotations;
