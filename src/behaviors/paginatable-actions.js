import {Action as actionDecorator} from '../actions';

export function PaginatableActions() {
  return cls => {
    actionDecorator()(cls.prototype, 'changeLimit');
    actionDecorator()(cls.prototype, 'changePage');
  };
}
