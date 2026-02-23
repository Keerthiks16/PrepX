import Lottie from 'lottie-react';
import sandyLoading from '../../assets/lottie/Sandy Loading.json';

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="w-64 h-64">
        <Lottie 
          animationData={sandyLoading} 
          loop={true} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default Loader;
