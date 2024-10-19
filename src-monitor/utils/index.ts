import hotoast, { Toast, ToastOptions, ValueOrFunction } from "react-hot-toast";

type Renderable = JSX.Element | string | null;
type Message = ValueOrFunction<Renderable, Toast>;

export const toast = {
  call(message: Message, opts: ToastOptions = {}) {
    return hotoast(message, {
      position: 'bottom-right',
      duration: 2000,
      ...opts
    })
  },
  error: function (message: Message, opts: ToastOptions = {}) {
    return hotoast.error(message, {
      position: 'bottom-right',
      duration: 2000,
      ...opts
    })
  },
  success: function (message: Message, opts: ToastOptions = {}) {
    return hotoast.success(message, {
      position: 'bottom-right',
      duration: 2000,
      ...opts
    })
  },
  loading: function (message: Message, opts: ToastOptions = {}) {
    return hotoast.loading(message, {
      position: 'bottom-right',
      ...opts
    })
  },
  custom: function (message: Message, opts: ToastOptions = {}) {
    return hotoast.custom(message, {
      position: 'bottom-right',
      ...opts
    })
  },
  dismiss: hotoast.dismiss,
  promise: hotoast.promise
}