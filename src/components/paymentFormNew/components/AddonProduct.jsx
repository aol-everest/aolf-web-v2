import React from 'react';
import { CMEAddon } from './CMEAddon';
import PropTypes from 'prop-types';

// TODO: Add AddonProduct component it will be formik field component allow user to select addon product by checkbox and if selected user also need to provide extra infromation

const handleCMEChange = (product, isChecked, formikProps) => {
  console.log('CME checkbox changed:', { product, isChecked });

  // Update both CME and product name fields atomically
  formikProps.setValues({
    ...formikProps.values,
    CME: !isChecked,
    [product.productName]: !isChecked,
  });
};

export function AddonProduct({ addOnProducts = [], formikProps, cmeAddOn }) {
  if (!addOnProducts?.length) {
    return null;
  }

  console.log('CME Addon Product:', addOnProducts[0]);
  console.log('Form Values:', formikProps.values);

  return (
    <div className="addon-products">
      {addOnProducts.map((product) => {
        // Skip non-CME products that don't need to be shown
        if (!product.isCMEAddOn) {
          return null;
        }

        const isChecked =
          product.isAddOnSelectionRequired || formikProps.values['CME'];

        return (
          <div key={product.productSfid} className="form-item checkbox">
            {!product.isAddOnSelectionRequired && (
              <>
                <input
                  type="checkbox"
                  className=""
                  checked={isChecked}
                  onChange={() =>
                    handleCMEChange(product, isChecked, formikProps)
                  }
                  value="CME"
                  name={product.productName}
                  id={product.productSfid}
                  disabled={product.isAddOnSelectionRequired}
                  aria-label={`Select ${product.productName}`}
                />
                <label
                  htmlFor={product.productSfid}
                  className="tw-flex tw-w-full"
                >
                  <span className="tw-mr-2">{product.productName}</span>
                  <span className="tw-font-medium">${product.unitPrice}</span>
                </label>
              </>
            )}
            {product.isAddOnSelectionRequired && (
              <div className="tw-flex tw-justify-between tw-w-full">
                <span className="tw-text-gray-700">{product.productName}</span>
                <span className="tw-font-medium">${product.unitPrice}</span>
              </div>
            )}
          </div>
        );
      })}

      {cmeAddOn && formikProps.values['CME'] && (
        <>
          <div className="tw-mt-4">
            <p className="tw-text-sm tw-text-gray-500 tw-mb-4">
              Please uncheck the box if you do not want to claim CME credits.
            </p>
          </div>
          <CMEAddon formikProps={formikProps} />
        </>
      )}
    </div>
  );
}

AddonProduct.propTypes = {
  addOnProducts: PropTypes.arrayOf(
    PropTypes.shape({
      productSfid: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      unitPrice: PropTypes.number.isRequired,
      isAddOnSelectionRequired: PropTypes.bool,
      isCMEAddOn: PropTypes.bool,
    }),
  ),
  formikProps: PropTypes.shape({
    values: PropTypes.object.isRequired,
    setValues: PropTypes.func.isRequired,
  }).isRequired,
  cmeAddOn: PropTypes.bool,
};

export default AddonProduct;
