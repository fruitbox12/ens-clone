import './PopUp.css'

const PopUp = ({toggle, ...props}) => {

  const handleClick = () => {
    toggle()
  }

  return (
    <div className="modal-window">
      <div className="modal_content">
        <span className="close" onClick={handleClick}>&times;</span>
        {props.children}
      </div>
    </div>
  )
}

export default PopUp