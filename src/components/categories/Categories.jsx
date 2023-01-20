import React from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import './Categories.scss';
import colors from '../../styles/_colors.scss';

const Categories = ({ categories, checkedCategories, setCheckedCategories }) => {
  const handleToggleCategory = (_event, newCategories) => {
    setCheckedCategories(newCategories);
  };

  return (
    <Box sx={{ width: '100%', mb: 3, mt: 3, backgroundColor: colors.secondaryGrayColor, padding: 3, borderRadius: 3 }}>
      Select your categories:
      <ToggleButtonGroup
        value={checkedCategories}
        onChange={handleToggleCategory}
        aria-label="categories"
        color="primary"
        sx={{
          mt: 3,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
      {categories.map((c) => 
        <ToggleButton
          value={c.name}
          key={c.name}
          aria-label={c.name}
          sx={{
            color: colors.primaryTextColor,
            backgroundColor: colors.primaryColor,
            borderRadius: 0,
          }}
        >
        {c.name}
        </ToggleButton>
      )}
      </ToggleButtonGroup>
    </Box>
  )
}

export default Categories;