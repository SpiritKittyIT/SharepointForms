import * as React from 'react';

interface IError {
    showHandle: IHandle<boolean>
    message: string;
}

const Error: React.FC<IError> = ({showHandle, message}) => {
  return showHandle.value ? (
    <div id="myModal" className="modal" onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {showHandle.setValue(false)}}>
      <div className="modal-content">
        <p>Something went wrong. You have probably not used this app as intended. Please stop behaving like a little kid and do your job properly. ^^</p>
        <p>{message}</p>
      </div>
    </div>
  ) : ( <></> )
};

export default Error;
