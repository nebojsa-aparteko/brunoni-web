import React from 'react';
import Task, { TaskCategory } from '../../model/Task';
import MyDayOperationsTableRow from './MyDayOperationsTableRow';
import MyDayAccountingTableRow from './MyDayAccountingTableRow';

const MyDayTableRow: React.FC<Props> = ({
  task,
  selected,
  onSelectRow,
  updateComponent,
  taskCategory,
  handleOpenPreviewDialog,
}) => {
  return (
    <React.Fragment>
      {taskCategory === TaskCategory.OPERATIONS ? (
        <MyDayOperationsTableRow
          task={task}
          selected={selected}
          onSelectRow={onSelectRow}
          updateComponent={updateComponent}
        />
      ) : (
        <MyDayAccountingTableRow
          task={task}
          selected={selected}
          onSelectRow={onSelectRow}
          updateComponent={updateComponent}
          handleOpenPreviewDialog={handleOpenPreviewDialog}
        />
      )}
    </React.Fragment>
  );
};

interface Props {
  task: Task;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  updateComponent: () => void;
  taskCategory: TaskCategory;
  handleOpenPreviewDialog: (bookingId: string) => void;
}

export default MyDayTableRow;
