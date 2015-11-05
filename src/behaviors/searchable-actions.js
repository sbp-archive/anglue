import {Action as actionDecorator} from '../actions';

export function SearchableActions() {
  return cls => {
    actionDecorator()(cls.prototype, 'changeSearch');
    actionDecorator()(cls.prototype, 'clearSearch');
  };
}
