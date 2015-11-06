import {Action as actionDecorator} from '../actions';

export function FilterableActions() {
  return cls => {
    actionDecorator()(cls.prototype, 'changeSearch');
    actionDecorator()(cls.prototype, 'clearSearch');
    actionDecorator()(cls.prototype, 'changeFilter');
    actionDecorator()(cls.prototype, 'clearFilter');
  };
}
