import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BsLightningChargeFill,
  BsDropletFill,
  BsHammer,
  BsPaintBucket,
  BsWrenchAdjustable,
  BsSnow,
  BsFire,
  BsStars,
  BsFlower1,
  BsLayersFill
} from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';

const iconMap = {
  BsLightningChargeFill,
  BsDropletFill,
  BsHammer,
  BsPaintBucket,
  BsWrenchAdjustable,
  BsSnow,
  BsFire,
  BsStars,
  BsFlower1,
  BsLayersFill
};

const CategoryCard = ({ category }) => {
  if (!category) return null;
  const IconComponent = iconMap[category.icon] || BsLightningChargeFill;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card-custom h-100 p-4 d-flex flex-column justify-content-between position-relative overflow-hidden"
    >
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: `${category.color}15`,
              color: category.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: `0 8px 16px ${category.color}20`
            }}
          >
            <IconComponent />
          </div>
          <span className="badge-custom badge-primary">{category.count}</span>
        </div>

        <h5 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>{category.title}</h5>
        <p className="text-muted small mb-3">{category.description}</p>
      </div>

      <div>
        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
          <span className="small text-muted fw-semibold">Est. Rate: <span className="text-primary fw-bold">{category.avgPrice}</span></span>
          <Link
            to={`/workers?category=${category.id}`}
            className="btn btn-sm btn-outline-custom rounded-pill px-3"
            style={{ fontSize: '0.82rem' }}
          >
            Book Now <FiArrowRight className="ms-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
