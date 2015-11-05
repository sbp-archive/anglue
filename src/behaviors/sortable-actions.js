import {Action as actionDecorator} from '../actions';

export function SortableActions() {
  return cls => {
    actionDecorator()(cls.prototype, 'changeSort');
    actionDecorator()(cls.prototype, 'clearSort');
  };
}
