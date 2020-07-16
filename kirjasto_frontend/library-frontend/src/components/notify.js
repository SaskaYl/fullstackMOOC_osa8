import React from 'react'
const Notify=({errorMessage})=>{
    if(errorMessage==null){
        return null
    }
return (<div>
    {errorMessage}
</div>)
}
export default Notify