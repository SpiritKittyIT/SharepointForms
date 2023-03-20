import * as React from 'react';
import { Dispatch, SetStateAction } from "react";

interface IError {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

const Error: React.FC<IError> = ({show, setShow}) => {
  return show ? (
    <div id="myModal" className="modal" onClick={(event: any) => {setShow(false)}}>
      <div className="modal-content">
        <p>Something went wrong. You have probably not used this app as intended. Please stop behaving like a little kid and do your job properly. ^^</p>
      </div>
    </div>
  ) : ( <></> )
};

export default Error;
