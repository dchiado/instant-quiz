import React from "react";
import { TailSpin } from "react-loader-spinner"
import './LoadingSpinner.css';

const LoadingSpinner = ({ visible }) => (
  <div>
  {visible &&
    <div className="full-page-disable">
      <div className="spinner-wrapper">
        <TailSpin
          height="80"
          width="80"
          color="#a2faa3"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
          visible={visible}
        />
      </div>
    </div>
  }
  </div>
)

export default LoadingSpinner;
