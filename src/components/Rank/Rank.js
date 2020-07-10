import React from 'react';

const Rank = ({name, entries}) => {
	return(
		<div className='mt0 mb0'>
			<div className='white f3'>
				{`${name} , your current score count is...`}
			</div>
			<div className='white f1 '>
		        {entries}
		    </div>
		</div>
	);
}

export default Rank;