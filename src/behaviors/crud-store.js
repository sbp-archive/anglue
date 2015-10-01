import angular from 'angular';

export function CrudStore(config) {
	return (cls, className) => {
		console.log(cls, className);
	// let entity =
	// let isConfigObject = angular.isObject(config);
	// if (isConfigObject && config.entity) {
	//
	// }
	};
}


// import {Inject, CrudStore, SortableStore, Handler} from 'anglue/anglue';
//
// @Store()
// @CrudStore({
// 	entity: 'blueprint',
// 	actions: ['load', 'create', 'get', 'update', 'delete']
// })
// @SortableStore({
// 	initial: 'name'
// })
// export class BlueprintStore {
// 	@Inject() appActions;
//
// 	@Handler() onBlueprintUpdateCompleted() {
// 		this.appActions.notification('Blueprint saved...');
// 	}
// 	@Handler() onBlueprintCreateCompleted() {
// 		this.appActions.notification('Blueprint created...');
// 	}
// 	@Handler() onBlueprintDeleteCompleted() {
// 		this.appActions.notification('Blueprint deleted...');
// 	}
//
// 	@Handler() onBlueprintUpdateFailed(response) {
// 		this.appActions.error('Error updating blueprint...', JSON.stringify(response.data));
// 	}
// 	@Handler() onBlueprintCreateFailed(response) {
// 		this.appActions.error('Error creating blueprint...', JSON.stringify(response.data));
// 	}
// 	@Handler() onBlueprintDeleteFailed(response) {
// 		this.appActions.error('Error deleting blueprint...', JSON.stringify(response.data));
// 	}
// }
//
// export default BlueprintStore;
