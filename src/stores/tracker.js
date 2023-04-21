import { proxied } from 'svelte-proxied-store'
import { nanoid } from 'nanoid'

const createStore = () => {
  const {
    // delete: deleteProperty,
    assign,
    subscribe,
    emit,
    get
    // deleteAll
  } = proxied({
    get: function (target, key) {
      // console.log('$tracker proxy => ', {target, key})
      // if (!target[key]) refresh(key)
      return target[key] || {}
    }
  })

  // TODO also watch on chain tx event for all tracked tx
  const submit = ({ label, call, ...args }) => {
    const callId = nanoid()
    assign({
      [callId]: { label, step: 1 }
    })
    emit()
    call({
      ...args,
      onTx: (tx) => {
        console.log('[%s] onTx', callId, tx)
        assign({
          [callId]: { label, step: 2, tx }
        })
        emit()
      },
      onReceipt: (rcpt) => {
        console.log('onReceipt', rcpt)
        assign({
          [callId]: { ...get(callId), step: 3, rcpt }
        })
        emit()
        if (args.onReceipt) args.onReceipt(rcpt)
      },
      onError: (err, rcpt = {}) => {
        let errMsg = 'tx failed'
        if (err.code === 4001) {
          errMsg = 'signature denied'
        }
        assign({
          [callId]: { ...get(callId), errMsg, err, rcpt }
        })
        emit()
        if (args.onError) args.onError(err, rcpt)
      }
    })
    return callId
  }

  return {
    submit,
    subscribe
  }
}

const tracker = createStore()

export default tracker
