import Webcam from 'react-webcam';
import React from 'react';
import { Modal, notification } from 'antd';
import { useModel } from '@@/plugin-model/useModel';

const openNotificationWithIcon = () => {
  notification.error({
    message: '打开摄像头失败',
    description: '请检查摄像头是否连接，与应用是否获得摄像头操作权限，然后重试本操作',
  });
};

type CameraProps = {
  modalType: 'not-use' | 'front' | 'back';
  onCloseModal: () => void;
};

const Camera: React.FC<CameraProps> = (props) => {
  const { setImageFront, setImageBack } = useModel('image', (model) => ({
    setImageFront: model.setImageFront,
    setImageBack: model.setImageBack,
  }));
  const webcamRef = React.useRef(null);
  return (
    <Modal
      open={props.modalType != 'not-use'}
      centered
      destroyOnClose
      title="请拍摄"
      okText={'确认拍照'}
      cancelText={'关闭'}
      onOk={async () => {
        // @ts-ignore
        const imageSrc = webcamRef?.current?.getScreenshot();
        if (props.modalType == 'front') {
          setImageFront({
            imageBase64: imageSrc,
          });
        } else if (props.modalType == 'back') {
          setImageBack({
            imageBase64: imageSrc,
          });
        }
        props.onCloseModal();
      }}
      onCancel={props.onCloseModal}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        onUserMediaError={() => {
          openNotificationWithIcon();
          props.onCloseModal();
        }}
      />
    </Modal>
  );
};

export default Camera;
