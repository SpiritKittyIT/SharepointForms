import * as React from 'react';

interface IError {
    showHandle: IHandle<boolean>
    message: string;
}

const Error: React.FC<IError> = ({showHandle, message}) => {
  return showHandle.value ? (
    <div id='myModal' className='modal' onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {showHandle.setValue(false)}}>
      <div className='modal-content' onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {event.stopPropagation()}}>
        <p>{message}</p>
      </div>
    </div>
  ) : ( <></> )
};

export default Error;
